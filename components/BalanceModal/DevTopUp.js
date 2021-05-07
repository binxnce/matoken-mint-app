import React from 'react';
import PropTypes from 'prop-types';
import { utils } from 'ethers';
import { BRIDGE_TYPES } from '../../utils/constants';
import config from '../../config';
import Button from '../Button';

// for testing purpose only
const DevTopUp = ({ dualNetwork, topUpContract, walletProvider }) => {
  const convertETHtoDAI = () => {
    const iface = new utils.Interface(topUpContract.abi);
    const data = iface.encodeFunctionData('deposit', []);
    walletProvider
      .sendRequest('eth_sendTransaction', [
        {
          from: walletProvider.address,
          to: topUpContract?.tokenAddress,
          value: utils.parseEther('20').toHexString(),
          data,
        },
      ])
      .catch((e) => console.error(e));
  };

  const getDAI = () => {
    return walletProvider
      .sendRequest('eth_sendTransaction', [
        {
          from: walletProvider.address,
          to: config.mainToken,
          value: utils.parseEther('20').toHexString(),
        },
      ])
      .catch(console.error);
  };

  // !dualNetwork means user is connected to the project's network
  return (
    <>
      {!dualNetwork && !!config.mainToken && walletProvider.networkName === 'localA' && (
        <Button onClick={getDAI} style={{ marginTop: '0.1em' }}>
          DEV: Get 20 {config.mainTokenTicker}
        </Button>
      )}
      {dualNetwork === 'localB' && !!config.mainToken && topUpContract?.type === BRIDGE_TYPES.MULTI_TOKEN_BRIDGE && (
        <Button onClick={convertETHtoDAI} style={{ marginTop: '0.1em' }}>
          DEV: Convert 20 ETH to {config.mainTokenTicker}
        </Button>
      )}
    </>
  );
};

DevTopUp.propTypes = {
  dualNetwork: PropTypes.string,
  topUpContract: PropTypes.object,
  walletProvider: PropTypes.object.isRequired,
};

export default DevTopUp;
