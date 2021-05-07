import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Modal, { ModalTitle } from './Modal';
import Button, { LinkButton } from './Button';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 40px;
`;

const InsufficientBalanceModal = (props) => {
  return (
    <Modal {...props}>
      <Wrapper>
        <ModalTitle>Insufficient balance</ModalTitle>

        <Button variant="tertiary">Buy tokens</Button>
        <Button variant="secondary">Swap with Pillar</Button>
        <LinkButton color="button">Save to Favorites</LinkButton>
        <LinkButton color="button">Share link to this meme</LinkButton>
      </Wrapper>
    </Modal>
  );
};

InsufficientBalanceModal.propTypes = {
  onHide: PropTypes.func,
};

export default InsufficientBalanceModal;
