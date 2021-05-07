import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { fontSize, fontWeight } from '../utils/variables';

import Modal from './Modal';
import Button from './Button';

const Message = styled.p`
  font-size: ${fontSize.m};
  font-weight: ${fontWeight.regular};
  margin-bottom: 30px;
`;

const PostSaleModal = (props) => (
  <Modal {...props}>
    <div className="d-flex flex-column align-items-center">
      <Message>Congrats, You&apos;ve sold a part of the meme.</Message>
      <Button onClick={props.onHide} variant="navigation">
        OK
      </Button>
    </div>
  </Modal>
);

PostSaleModal.propTypes = {
  onHide: PropTypes.func,
};

export default PostSaleModal;
