import PropTypes from 'prop-types';
import React from 'react';

export const TOP_UP_STATUSES = {
  OPEN_METAMASK_AGAIN: 'Please submit the transaction (Open the MetaMask again)',
};

const TopUpStatus = ({ status }) => {
  const text = TOP_UP_STATUSES[status] || status;
  const isWarning = Object.keys(TOP_UP_STATUSES).includes(status);
  const style = isWarning ? { color: 'red' } : {};
  return <div style={style}>{text}</div>;
};

TopUpStatus.propTypes = {
  status: PropTypes.string.isRequired,
};

export default TopUpStatus;
