import React from 'react';
import PropTypes from 'prop-types';
import { Modal as BootstrapModal } from 'react-bootstrap';
import styled from 'styled-components';

import { fontSize } from '../utils/variables';
import BigCloseButton from './BigCloseButton';

const CornerCloseButton = styled(BigCloseButton)`
  margin: 40px;
  margin-bottom: 20px;
`;

const StyledModal = styled(BootstrapModal)`
  .modal-dialog {
    max-width: 620px;
  }

  .modal-content {
    border: none;
    border-radius: 40px;
    box-shadow: 0 6px 25px 0 rgba(0, 0, 0, 0.2);
  }

  .modal-body {
    padding: 0 80px 80px 80px;
  }
`;

const Modal = ({ children, bodyStyle, ...modalProps }) => {
  return (
    <StyledModal {...modalProps}>
      <CornerCloseButton onClick={modalProps.onHide} />
      <BootstrapModal.Body className="d-flex flex-column" style={bodyStyle}>
        {children}
      </BootstrapModal.Body>
    </StyledModal>
  );
};

Modal.propTypes = {
  children: PropTypes.node,
  bodyStyle: PropTypes.object,
};

export default Modal;

export const ModalTitle = styled(BootstrapModal.Title)`
  font-size: ${fontSize.xxl};
  text-align: center;
`;
