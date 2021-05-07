import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import SdkService from '../services/SdkService';
import config from '../config';
import { formatCurrency, getShortAddress } from '../utils/ui';

const ShortAddress = styled.span`
  color: blue;
  margin-left: 0.5em;
`;

const Balance = styled.span`
  color: black;
  margin-left: 0.5em;
`;

const WALLET_PROVIDERS = SdkService.SUPPORTED_WALLET_PROVIDERS;

// placeholder
const AccountIcon = styled(({ type, ...rest }) => {
  if (type === WALLET_PROVIDERS.METAMASK) {
    return <img src="/images/metaMask_logo.png" {...rest} />;
  }

  if (type === WALLET_PROVIDERS.WALLET_CONNECT) {
    return <img src="/images/walletConnect_logo.png" {...rest} />;
  }

  return null;
})`
  width: 1em;
`;

AccountIcon.propTypes = {
  type: PropTypes.oneOf([WALLET_PROVIDERS.METAMASK, WALLET_PROVIDERS.WALLET_CONNECT, WALLET_PROVIDERS.TORUS])
    .isRequired,
};

const AccountInfo = () => {
  const { current: user } = useSelector((state) => state.users);

  const shortAddress = getShortAddress(user.address);
  const accountBalance = user.ethBalanceFormatted.slice(0, 6);

  return (
    user && (
      <span className="d-flex align-items-center">
        <AccountIcon type={user.type} />
        <ShortAddress>{shortAddress}</ShortAddress>
        <Balance>{formatCurrency(accountBalance, config.currencySymbol)}</Balance>
      </span>
    )
  );
};

export default AccountInfo;
