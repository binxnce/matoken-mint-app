import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { MetaMaskWalletProvider } from 'etherspot';
import WalletConnect from '@walletconnect/client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import cookie from 'cookie-cutter';
import noop from 'lodash/noop';

// import config from '../config';

import { signOutUser, getUser, setSdkUser, setWalletProvider } from '../redux/users';
import serviceContext from '../services/serviceContext';
import SdkService from '../services/SdkService';

import IntroModal from './IntroModal';
import Modal, { ModalTitle } from './Modal';
import Button from './Button';

let Torus;
const INTRO_COOKIE_KEY = 'did_show_intro';

const LoginModal = (props) => {
  let walletConnect = null;
  const dispatch = useDispatch();
  const { sdkService } = useContext(serviceContext);
  const [isIntroShown, setIsIntroShown] = useState(false);

  const hideLoginModal = props.onHide ?? noop;

  useEffect(() => {
    async function loadScripts() {
      Torus = (await import('@toruslabs/torus-embed')).default;
    }
    loadScripts();
  }, []);

  const login = async (providerType, providerData) => {
    try {
      const walletProvider = await sdkService.connectToWalletProvider(providerType, providerData);
      const sdkState = await sdkService.initSdk(walletProvider);
      if (!sdkState) throw new Error('Unable to connect to the server');
      const { account } = sdkState;
      setSdkUser(account)(dispatch);
      setWalletProvider(walletProvider)(dispatch);
      getUser()(dispatch);
      hideLoginModal();

      if (cookie.get(INTRO_COOKIE_KEY) !== 'true') {
        cookie.set(INTRO_COOKIE_KEY, 'true', { expires: new Date(3000, 0, 1) });
        setIsIntroShown(true);
      }
    } catch (err) {
      await sdkService.killSession().catch((_) => _);
      alert(err.message);
    }
  };

  const loginMetamask = async (e) => {
    e.preventDefault();
    if (!MetaMaskWalletProvider.detect()) {
      alert('MetaMask is not detected');
      return;
    }
    await login(SdkService.SUPPORTED_WALLET_PROVIDERS.METAMASK);
  };

  // eslint-disable-next-line no-unused-vars
  const loginWalletConnect = async (e) => {
    e.preventDefault();

    walletConnect = new WalletConnect({
      bridge: 'https://bridge.walletconnect.org',
      qrcodeModal: QRCodeModal,
    });

    if (!walletConnect.connected) {
      await walletConnect.createSession().catch((e) => alert(e.message));
    }

    window.walletConnectConnector = walletConnect;
    subscribeToEvents();
  };

  const loginTorus = async (e) => {
    e.preventDefault();

    const torus = new Torus();
    try {
      await torus.init();
      await torus.login();
    } catch (e) {
      alert(e.message);
      return;
    }

    await login(SdkService.SUPPORTED_WALLET_PROVIDERS.TORUS, torus);
  };

  const subscribeToEvents = () => {
    if (!walletConnect) {
      return;
    }

    walletConnect.on('session_update', async (error, payload) => {
      if (error) {
        throw error;
      }
      const { chainId, accounts } = payload.params[0];
      onSessionUpdate(accounts, chainId);
    });

    walletConnect.on('connect', (error, payload) => {
      if (error) {
        throw error;
      }
      const { chainId, accounts } = payload.params[0];
      onSessionUpdate(accounts, chainId);
    });

    walletConnect.on('disconnect', (error) => {
      if (error) {
        throw error;
      }
      sdkService
        .killSession()
        .catch(() => null)
        .finally(() => {
          signOutUser()(dispatch);
          window.location.href = '/';
        });
    });

    if (walletConnect.connected) {
      const { chainId, accounts } = walletConnect;
      onSessionUpdate(accounts, chainId);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const onSessionUpdate = async (accounts, chainId) => {
    /*if (chainId !== config.chainId) {
      alert('Wrong network selected');
      return;
    }*/
    await login(SdkService.SUPPORTED_WALLET_PROVIDERS.WALLET_CONNECT, walletConnect);
    hideLoginModal();
  };

  return (
    <>
      <Modal {...props} aria-labelledby="loginLabel" bodyStyle={{ display: 'grid', gridGap: '20px' }}>
        <ModalTitle>Sign In</ModalTitle>
        <Button variant="primary" onClick={loginMetamask}>
          Metamask
        </Button>
        <Button variant="primary" onClick={loginWalletConnect}>
          WalletConnect
        </Button>
        <Button variant="primary" onClick={loginTorus}>
          Social Login
        </Button>
      </Modal>
      <IntroModal show={isIntroShown} onHide={() => setIsIntroShown(false)} />
    </>
  );
};

LoginModal.propTypes = {
  onHide: PropTypes.func,
};

export default LoginModal;

export const OpenLoginModalContext = React.createContext(noop);
