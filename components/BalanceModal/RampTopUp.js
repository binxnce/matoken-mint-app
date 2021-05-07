import React from 'react';
import { useDispatch } from 'react-redux';
import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';
import PropTypes from 'prop-types';

import { getUser } from '../../redux/users';
import { getBaseUrl } from '../../utils/common';
import Button from '../Button';

const RampTopUp = ({ userAddress, onModalHide }) => {
  const dispatch = useDispatch();
  const showRampTopUp = () => {
    new RampInstantSDK({
      hostAppName: 'Dank Meme',
      hostLogoUrl: `${getBaseUrl()}/images/logo.png`,
      // url: 'https://ri-widget-staging.firebaseapp.com/', // for testing
      defaultAsset: 'xDAI', // comment out for testing
      userAddress,
    })
      .on('WIDGET_CLOSE', () => getUser()(dispatch))
      .show();
    onModalHide();
  };

  return <Button onClick={showRampTopUp}>Top up with Credit Card</Button>;
};

RampTopUp.propTypes = {
  userAddress: PropTypes.string.isRequired,
  onModalHide: PropTypes.func.isRequired,
};

export default RampTopUp;
