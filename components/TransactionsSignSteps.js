import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import { colors } from '../utils/variables';
import { loadTransactionGroups } from '../redux/transactionGroups';

import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';
import serviceContext from '../services/serviceContext';
import { prependAllowanceTransactions, cancelTransaction } from '../utils/transactions';

const InfoWrapper = styled.div`
  text-align: center;
  width: 100%;
  padding: 20px;
`;

const ActionTitle = styled.h5`
  margin-bottom: 20px;
  margin-top: 10px;
`;

const ErrorMessage = styled.p`
  margin-top: 10px;
  text-align: center;
  color: ${colors.error};
  font-size: 14px;
`;

const TransactionInfo = (props) => {
  const { title, sendTransaction, cancelTransaction } = props;
  return (
    <InfoWrapper>
      <ActionTitle>{title}</ActionTitle>
      <ButtonGroup center style={{ paddingBottom: 10 }}>
        <Button tertiary text="Cancel" block onClick={cancelTransaction} />
        <Button secondary text="Sign" block onClick={sendTransaction} />
      </ButtonGroup>
    </InfoWrapper>
  );
};

TransactionInfo.propTypes = {
  title: PropTypes.string.isRequired,
  sendTransaction: PropTypes.func.isRequired,
  cancelTransaction: PropTypes.func.isRequired,
};

const TransactionsSignSteps = ({ active, onSuccess, onDismiss, transactionIdentificationData, onResize }) => {
  const dispatch = useDispatch();
  const relevantTransactionGroup = useSelector(({ transactionGroups: { transactionGroups } }) => {
    if (!transactionIdentificationData) return undefined;
    const { memeId } = transactionIdentificationData;
    if (memeId) return transactionGroups.find(({ meme }) => meme === memeId);
    return undefined;
  });

  const { sdkService } = useContext(serviceContext);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(undefined);

  useEffect(() => {
    loadTransactionGroups()(dispatch);
  }, [active]);

  useEffect(() => {
    if (onResize) onResize();
  }, [error]);

  useEffect(() => {
    setIsLoading(false);
  }, [relevantTransactionGroup]);

  const manageSendTransactions = async (transactions, onSuccess, txGroupId) => {
    let transactionsToSubmit = prependAllowanceTransactions(transactions);
    if (!transactionsToSubmit.length) return;

    try {
      await sdkService.sendTransactions(transactionsToSubmit, txGroupId);
      onSuccess && onSuccess();
    } catch (e) {
      let errorMessage = e?.message || e;
      if (errorMessage.includes('Transaction reverted')) {
        errorMessage = 'Unable to estimate the transaction. Maybe your balance is too low';
      }
      setError(errorMessage);
    }
  };

  const manageCancelTransaction = (transactionGroupId) => {
    cancelTransaction(transactionGroupId)
      .then(onDismiss)
      .catch((e) => setError(e));
  };

  const renderContent = () => {
    if (relevantTransactionGroup?.transactions[0]) {
      return (
        <TransactionInfo
          title={relevantTransactionGroup.action}
          sendTransaction={async () => {
            manageSendTransactions(relevantTransactionGroup.transactions, onSuccess, relevantTransactionGroup._id);
          }}
          cancelTransaction={() => manageCancelTransaction(relevantTransactionGroup._id)}
        />
      );
    }

    return null;
  };

  return (
    <>
      {isLoading ? (
        <p>loading....</p>
      ) : (
        <>
          {renderContent()}
          {!!error && <ErrorMessage>{error}</ErrorMessage>}
        </>
      )}
    </>
  );
};

TransactionsSignSteps.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  transactionIdentificationData: PropTypes.object.isRequired,
  active: PropTypes.bool,
  onResize: PropTypes.func,
};

export default TransactionsSignSteps;
