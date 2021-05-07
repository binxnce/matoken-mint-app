import React, { useContext, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';

import { loadTransactionGroups } from '../redux/transactionGroups';
import { loadUserMemes } from '../redux/memes';
import { colors } from '../utils/variables';
import { WEBSOCKETS_NOTIFICATIONS } from '../utils/constants';
import { prependAllowanceTransactions, cancelTransaction } from '../utils/transactions';
import serviceContext from '../services/serviceContext';
import TransactionCard from './TransactionCard';

const ErrorWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
`;

const ErrorText = styled.p`
  font-size: 14px;
  color: ${colors.error};
  width: 100%;
  text-align: center;
`;

const transactionGroupsSelector = ({ transactionGroups: { transactionGroups }, memes: { userMemes } }) =>
  transactionGroups.map((tg) => {
    let currentTg = tg;
    if (tg.meme) {
      const relatedMeme = userMemes.find(({ _id }) => _id === tg.meme);
      if (relatedMeme) currentTg.memeInfo = relatedMeme;
    }
    return currentTg;
  });

const PendingTransactions = () => {
  const dispatch = useDispatch();
  const { notificationService } = useContext(serviceContext);

  const transactionGroups = useSelector(transactionGroupsSelector);

  const refresh = () => {
    loadTransactionGroups()(dispatch);
    loadUserMemes()(dispatch);
  };

  useEffect(refresh, []);

  useEffect(() => {
    function onNewNotification({ notification }) {
      if (notification.type === WEBSOCKETS_NOTIFICATIONS.TRANSACTION_NOTIFICATION) {
        refresh();
      }
    }
    notificationService.subscribe(onNewNotification);
    return () => {
      notificationService.unsubscribe(onNewNotification);
    };
  }, []);

  const { sdkService } = useContext(serviceContext);
  const [error, setError] = useState(undefined);

  const manageCancelTransaction = async (transactionGroupId) => {
    await cancelTransaction(transactionGroupId);
    refresh();
  };

  const sendAndRefresh = async (transactions, txGroupId) => {
    let transactionsToSubmit = prependAllowanceTransactions(transactions);

    try {
      await sdkService.sendTransactions(transactionsToSubmit, txGroupId);
    } catch (e) {
      setError(e?.message || e);
    } finally {
      refresh();
    }
  };

  if (!transactionGroups || transactionGroups.length === 0) {
    return (
      <div className="text-center mt-3 noOwnedMemes">
        <p>All good. Nothing to sign :)</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <ErrorWrapper>
          <ErrorText>{error}</ErrorText>
        </ErrorWrapper>
      )}
      {transactionGroups.map((tg) => (
        <TransactionCard
          {...tg}
          sendTransactions={sendAndRefresh}
          cancelTransaction={manageCancelTransaction}
          key={tg._id}
        />
      ))}
    </>
  );
};

export default PendingTransactions;
