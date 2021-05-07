import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Stepper from './Stepper';
import Modal, { ModalTitle } from './Modal';
import TransactionsSignSteps from './TransactionsSignSteps';
import Card from './Card';
import MemeImage from './MemeImage';
import Button from './NeonButton';
import { media } from '../utils/variables';

const MemeInfoWrapper = styled.div`
  text-align: center;
  width: 100%;
  margin: 20px 0;
`;

const SuccessMessageWrapper = styled.div`
  text-align: center;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 40px;
`;

const CardMemeImageWrapper = styled(Card)`
  display: inline-block;
  width: 200px;
`;

const MemeTitle = styled.h6`
  margin-top: 16px;
`;

const SuccessTitle = styled.h3`
  display: block;
  width: 100%;
  margin-bottom: 20px;
  font-size: 26px;

  @media ${media.max.tablet} {
    font-size: 20px;
  }
`;

const SuccessBody = styled.p`
  width: 100%;
  margin-bottom: 40px;
  font-size: 16px;
`;

const MemeInfo = ({ meme, title }) => {
  return (
    <MemeInfoWrapper>
      <ModalTitle className="mb-4">{title}</ModalTitle>
      <CardMemeImageWrapper noPadding>
        <MemeImage meme={meme} />
      </CardMemeImageWrapper>
      <MemeTitle>{meme.title}</MemeTitle>
    </MemeInfoWrapper>
  );
};

MemeInfo.propTypes = {
  title: PropTypes.string.isRequired,
  meme: PropTypes.shape({
    title: PropTypes.string,
  }).isRequired,
};

const ActionModalWithSign = (props) => {
  const [transactionData, setTransactionData] = useState(undefined);
  const [isActionFinished, setIsActionFinished] = useState(false);
  const {
    isShown,
    onModalHide,
    modalTitle,
    actionTitle,
    actionView,
    memeInfo,
    successMessage,
    customModalTitle,
  } = props;

  const onActionSuccess = (data, goToSign) => {
    setTransactionData(data);
    if (data) goToSign();
  };

  const onSigningSuccess = () => {
    setIsActionFinished(true);
  };

  const closeModal = () => {
    onModalHide();
  };

  const resetModalData = () => {
    setTransactionData(undefined);
    setIsActionFinished(false);
  };

  const generateSignAction = (onResize) => {
    if (!transactionData) return null;
    return (
      <TransactionsSignSteps
        transactionIdentificationData={transactionData}
        onSuccess={onSigningSuccess}
        onDismiss={closeModal}
        onResize={onResize}
      />
    );
  };

  const title = memeInfo ? '' : modalTitle;

  const successAction = props.customSuccessAction ?? { label: 'Cool', action: closeModal };

  return (
    <>
      <Modal show={isShown} onHide={onModalHide} onExited={resetModalData}>
        {!isActionFinished && (
          <>
            <div className="mb-4">
              {!!title && <ModalTitle>{title}</ModalTitle>}
              {customModalTitle}
              {!!memeInfo && <MemeInfo meme={memeInfo} title={modalTitle} />}
            </div>
            <Stepper
              steps={[
                {
                  id: 'mainAction',
                  title: actionTitle,
                  content: ({ active, goNext, updateStepper }) =>
                    actionView(active, (data) => onActionSuccess(data, goNext), updateStepper),
                },
                {
                  id: 'sign',
                  title: 'Sign',
                  content: ({ updateStepper }) => generateSignAction(updateStepper),
                },
              ]}
              onLastDoneTab={closeModal}
            />
          </>
        )}
        {!!isActionFinished && (
          <SuccessMessageWrapper>
            <SuccessTitle>Success!</SuccessTitle>
            {!!successMessage && <SuccessBody>{successMessage}</SuccessBody>}
            <Button main text={successAction.label} block onClick={successAction.action} />
          </SuccessMessageWrapper>
        )}
      </Modal>
    </>
  );
};

ActionModalWithSign.propTypes = {
  isShown: PropTypes.bool,
  onModalHide: PropTypes.func.isRequired,
  modalTitle: PropTypes.string,
  actionTitle: PropTypes.string.isRequired,
  actionView: PropTypes.func.isRequired,
  memeInfo: PropTypes.object,
  successMessage: PropTypes.string,
  customModalTitle: PropTypes.object,
  customSuccessAction: PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
  }),
};

export default ActionModalWithSign;
