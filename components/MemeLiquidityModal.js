import React from 'react';
import PropTypes from 'prop-types';
import ActionModalWithSign from './ActionModalWithSign';
import MemeLiquidityForm from './MemeLiquidityForm';

const MemeLiquidityModal = ({ isShown, onHide, meme, ownership, user }) => {
  return (
    <ActionModalWithSign
      isShown={isShown}
      modalTitle="Add/Remove liquidity"
      actionTitle="Enter amount"
      onModalHide={onHide}
      memeInfo={meme}
      successMessage="Liquidity has been updated"
      actionView={(active, onSuccess, updateStepper) => (
        <MemeLiquidityForm
          meme={meme}
          user={user}
          ownership={ownership}
          active={active}
          onSuccess={onSuccess}
          updateStepper={updateStepper}
          onDismiss={onHide}
        />
      )}
    />
  );
};

MemeLiquidityModal.propTypes = {
  isShown: PropTypes.bool,
  onHide: PropTypes.func,
  meme: PropTypes.object,
  ownership: PropTypes.object,
  user: PropTypes.object,
};

export default MemeLiquidityModal;
