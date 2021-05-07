import React from 'react';
import PropTypes from 'prop-types';
import { BINANCE_BRIDGE_STATUSES } from '../../utils/constants';

const {
  WAITING_FOR_DEPOSIT,
  CANCELLED,
  COMPLETED,
  WITHDRAW_IN_PROGRESS,
  DEPOSIT_IN_PROGRESS,
} = BINANCE_BRIDGE_STATUSES;

const getBinanceChainStatus = (status) => {
  switch (status) {
    case WAITING_FOR_DEPOSIT:
      return 'Waiting for deposit to be completed';
    case DEPOSIT_IN_PROGRESS:
      return 'Confirming deposit';
    case WITHDRAW_IN_PROGRESS:
      return 'Topping up your account';
    case COMPLETED:
      return 'Completed!';
  }
  return '';
};

const BridgeTransactionStatus = ({ swap, depositTxHash }) => {
  if (swap.status === CANCELLED) return '';

  const confirmations =
    swap.status === DEPOSIT_IN_PROGRESS && swap.depositReceivedConfirms
      ? `/ Confirmations: ${swap.depositReceivedConfirms}/${swap.depositRequiredConfirms}`
      : '';

  const status = getBinanceChainStatus(swap.status);

  return (
    <div>
      {swap.amount} {swap.symbol} Top up
      <br />
      Status: {status} {confirmations}
      <br />
      <a href={swap.depositTxLink.replace('{txid}', depositTxHash)} target="_blank" rel="noopener noreferrer">
        Deposit details
      </a>
      {swap.swapTxId && (
        <div>
          <a href={swap.swapTxLink.replace('{txid}', swap.swapTxId)} target="_blank" rel="noopener noreferrer">
            Top up details
          </a>
        </div>
      )}
    </div>
  );
};

BridgeTransactionStatus.propTypes = {
  swap: PropTypes.object.isRequired,
  depositTxHash: PropTypes.string.isRequired,
};

export default BridgeTransactionStatus;
