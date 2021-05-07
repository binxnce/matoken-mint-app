import React, { useContext, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';
import { Col, Row } from 'react-bootstrap';

import config from '../config';
import { colors } from '../utils/variables';
import { formatCurrency, pluralize } from '../utils/ui';
import { fromWei, weiToShards } from '../utils/transactions';
import {
  BRIDGE_TYPES,
  TRANSACTION_GROUP_STATUS,
  WEBSOCKETS_NOTIFICATIONS,
  BINANCE_BRIDGE_STATUSES,
  VALIDATOR_STATUSES,
} from '../utils/constants';
import { loadHistory } from '../redux/history';
import serviceContext from '../services/serviceContext';

import MemeImage from './MemeImage';
import Alert from './Alert';
import MemeModalHandler from './MemeModalHandler';
import MemeLink from './MemeLink';
import TableListEntry from './TableListEntry';

const CardContent = styled(Row)`
  align-items: center;
`;

const TxLinkColumn = styled(Col)`
  text-align: right;
  font-size: 12px;

  a {
    color: ${colors.secondary};
    font-size: 12px;
  }
`;

const DetailsColumn = styled(Col)`
  align-self: flex-start;
`;

const DetailsContent = styled(Col)`
  padding-top: 6px;
  font-size: 12px;
`;

const CardMemeImage = styled(MemeImage)`
  height: 70px;
`;

const CardTitle = styled.h6`
  text-transform: none;
  font-weight: 500;
  color: ${colors.text};
  margin: 0;
`;

const Label = styled.p`
  text-transform: none;
  font-weight: 400;
  color: ${colors.secondaryText};
  font-size: 12px;
  margin: 0;
`;

const MaybeMemeLink = ({ memeId, children }) =>
  memeId ? (
    <MemeLink memeId={memeId}>
      <a>{children}</a>
    </MemeLink>
  ) : (
    children
  );

MaybeMemeLink.propTypes = {
  memeId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.node,
};

const Title = ({ action, meme, memeTokensAmount, user, me }) => {
  const memeTitle = !!meme && (
    <MaybeMemeLink memeId={meme.enabled && !meme.isArchived && meme._id}>&ldquo;{meme.title}&rdquo;</MaybeMemeLink>
  );

  switch (action) {
    case 'CREATE':
      return <>Created {memeTitle}</>;
    case 'ADD_LIQUIDITY':
      return <>Added liquidity to {memeTitle}</>;
    case 'REMOVE_LIQUIDITY':
      return <>Removed liquidity from {memeTitle}</>;
    case 'BUY': {
      const shards = weiToShards(memeTokensAmount, meme.maxShards);
      return user._id === me._id ? (
        <>
          You bought {pluralize(shards, 'shard')} of {memeTitle}
        </>
      ) : (
        <>
          {pluralize(shards, 'shard')} of {memeTitle} were sold
        </>
      );
    }
    case 'SELL': {
      const shards = weiToShards(memeTokensAmount, meme.maxShards);
      return user._id === me._id ? (
        <>
          You sold {pluralize(shards, 'shard')} of {memeTitle}
        </>
      ) : (
        <>
          {pluralize(shards, 'shard')} of {memeTitle} were bought
        </>
      );
    }
    case 'TOP_UP':
      return 'New deposit';
    case 'BRIDGE_TOP_UP':
      return 'New deposit via bridge';
    case 'WITHDRAWAL':
      return 'New withdrawal';
    default:
      return null;
  }
};

Title.propTypes = {
  action: PropTypes.string.isRequired,
  meme: PropTypes.object,
  user: PropTypes.shape({
    _id: PropTypes.string,
  }),
  me: PropTypes.shape({
    _id: PropTypes.string,
  }).isRequired,
  memeTokensAmount: PropTypes.string,
};

const Details = ({ action, meme, memeTokensAmount, ethAmount, user, me, withdrawal, deposit }) => {
  let content = '';

  switch (action) {
    case 'CREATE':
      content = `Max shards: ${meme.maxShards}`;
      break;
    case 'ADD_LIQUIDITY': {
      const shards = weiToShards(memeTokensAmount, meme.maxShards);
      const addedEth = fromWei(ethAmount);
      content = `Added ${pluralize(shards, 'shard')} and ${formatCurrency(addedEth, config.currencySymbol)}`;
      break;
    }
    case 'REMOVE_LIQUIDITY': {
      if (memeTokensAmount && ethAmount) {
        const shards = weiToShards(memeTokensAmount, meme.maxShards);
        const receivedEth = fromWei(ethAmount);
        content = `Received ${pluralize(shards, 'shard')} and ${formatCurrency(receivedEth, config.currencySymbol)}`;
      }
      break;
    }
    case 'BUY': {
      const paid = fromWei(ethAmount);
      content = `Paid: ${formatCurrency(paid, config.currencySymbol)}`;
      content += user._id !== me._id ? `User: ${user.name}` : '';
      break;
    }
    case 'SELL': {
      if (ethAmount) {
        const received = fromWei(ethAmount);
        content = `Received: ${formatCurrency(received, config.currencySymbol)}`;
      }
      content += user._id !== me._id ? `User: ${user.name}` : '';
      break;
    }
    case 'TOP_UP':
    case 'BRIDGE_TOP_UP': {
      const amount = fromWei(ethAmount);
      content = `Deposit: ${formatCurrency(amount, config.currencySymbol)}`;
      if (deposit?.fee) {
        content = (
          <>
            {content}
            <br />
            Fee: {formatCurrency(fromWei(deposit.fee), config.currencySymbol)}
          </>
        );
      }
      break;
    }
    case 'WITHDRAWAL': {
      const amount = fromWei(ethAmount);
      content = (
        <>
          Amount withdrew: {formatCurrency(amount, config.currencySymbol)}
          <br />
          Receiver: {withdrawal.receiver}
        </>
      );
      break;
    }
  }

  if (!content) return null;
  return (
    <Row>
      <DetailsContent>{content}</DetailsContent>
    </Row>
  );
};

Details.propTypes = {
  action: PropTypes.string.isRequired,
  meme: PropTypes.object,
  memeTokensAmount: PropTypes.string,
  ethAmount: PropTypes.string,
  user: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
  }),
  me: PropTypes.shape({
    _id: PropTypes.string,
  }).isRequired,
  withdrawal: PropTypes.object,
  deposit: PropTypes.object,
};

const getTransactionStatusToDisplay = (status) => {
  switch (status) {
    case TRANSACTION_GROUP_STATUS.FAILED:
      return 'Failed';
    case TRANSACTION_GROUP_STATUS.PENDING:
      return 'Pending';
    case TRANSACTION_GROUP_STATUS.CREATED:
      return 'Not submitted';
  }
  return '';
};

const getBinanceBridgeStatus = (status) => {
  switch (status) {
    case BINANCE_BRIDGE_STATUSES.CANCELLED:
      return 'Expired';
    case BINANCE_BRIDGE_STATUSES.DEPOSIT_IN_PROGRESS:
      return 'Deposit in progress';
    case BINANCE_BRIDGE_STATUSES.WAITING_FOR_DEPOSIT:
      return 'Waiting for deposit';
    case BINANCE_BRIDGE_STATUSES.WITHDRAW_IN_PROGRESS:
      return 'Withdraw in progress';
  }
  return '';
};

const getMultiTokenBridgeStatus = (depositData) => {
  if (depositData.validatorStatus === VALIDATOR_STATUSES.INVALID) {
    return 'Invalid deposit';
  }
  if (depositData.validatorStatus === VALIDATOR_STATUSES.NOT_CHECKED) {
    return 'Waiting for deposit';
  }
  return '';
};

const History = () => {
  const dispatch = useDispatch();
  const { notificationService } = useContext(serviceContext);
  const { history } = useSelector((state) => state.history);
  const { current: user } = useSelector((state) => state.users);
  const topUpContract = useSelector((state) => state.users.current?.topUpContract);

  useEffect(() => {
    loadHistory()(dispatch);
  }, []);

  useEffect(() => {
    function onNewNotification({ notification }) {
      if (notification.type === WEBSOCKETS_NOTIFICATIONS.TRANSACTION_NOTIFICATION) {
        loadHistory()(dispatch);
      }
    }
    notificationService.subscribe(onNewNotification);
    return () => {
      notificationService.unsubscribe(onNewNotification);
    };
  }, []);

  if (!history || !history.length) {
    return (
      <div className="text-center mt-3 noOwnedMemes">
        <p>No actions taken, yet...</p>
      </div>
    );
  }

  const hasPendingTransactions = history.some(
    (data) => data.transactionGroup?.status === TRANSACTION_GROUP_STATUS.PENDING,
  );

  const historyRecords = history.map((data, i) => {
    let txLinks = [];
    const txHash =
      data.transactionGroup?.hash ||
      data.deposit?.outgoingTxHash ||
      data.deposit?.sourceTxHash ||
      data.withdrawal?.txHash;
    const txLinkText = 'Transaction details';
    const txLink = txHash ? `${config.bcxUrl}${txHash}` : '';
    const status = getTransactionStatusToDisplay(data.transactionGroup?.status || data.withdrawal?.status);

    txLinks.push({
      txHash,
      txLinkText,
      txLink,
      status,
    });

    if (data.deposit?.type === BRIDGE_TYPES.BINANCE_BRIDGE) {
      txLinks = [
        {
          status: getBinanceBridgeStatus(data.deposit.bridgeStatus),
          txLink: data.deposit.sourceTxHash ? `https://etherscan.io/tx/${data.deposit.sourceTxHash}` : '',
          txLinkText: 'Deposit transaction details',
        },
      ];
      if (data.deposit.outgoingTxHash) {
        txLinks.push({
          txLink: `https://bscscan.io/tx/${data.deposit.outgoingTxHash}`,
          txLinkText: 'Withdraw transaction details',
        });
      }
    }

    if (data.deposit?.type === BRIDGE_TYPES.MULTI_TOKEN_BRIDGE) {
      txLinks = [
        {
          status: getMultiTokenBridgeStatus(data.deposit),
          txLink: data.deposit.sourceTxHash ? `${topUpContract.bcxUrl}${data.deposit.sourceTxHash}` : '',
          txLinkText: 'Deposit transaction details',
        },
      ];
      if (data.deposit.outgoingTxHash) {
        txLinks.push({
          txLink: `${config.bcxUrl}${data.deposit.outgoingTxHash}`,
          txLinkText: 'Withdraw transaction details',
        });
      }
    }

    return (
      <TableListEntry key={i}>
        <CardContent>
          <Col sm={3} xs={4}>
            {!!data.meme && (
              <MaybeMemeLink memeId={data.meme.enabled && !data.meme.isArchived && data.meme._id}>
                <CardMemeImage meme={data.meme} />
              </MaybeMemeLink>
            )}
          </Col>
          <DetailsColumn sm={9} xs={8}>
            <Row>
              <Col>
                <Label>
                  {moment(data.createdAt)
                    .utc(true)
                    .format('MMMM DD YYYY H:mm:ss')}
                </Label>
                <CardTitle>
                  <Title {...data} me={user} />
                </CardTitle>
              </Col>
              <TxLinkColumn>
                {txLinks.map(({ txLink, txLinkText, status }) => (
                  <div key={txLink}>
                    {!!txLink && (
                      <>
                        <a href={txLink} target="_blank" rel="noopener noreferrer">
                          {txLinkText}
                        </a>
                        {!!status && ` [${status}]`}
                      </>
                    )}
                    {!txLink && status}
                  </div>
                ))}
              </TxLinkColumn>
            </Row>
            <Details {...data} me={user} />
          </DetailsColumn>
        </CardContent>
      </TableListEntry>
    );
  });

  return (
    <>
      {hasPendingTransactions && <Alert>confirmation may take a while</Alert>}
      {historyRecords}
      <MemeModalHandler />
    </>
  );
};

export default History;
