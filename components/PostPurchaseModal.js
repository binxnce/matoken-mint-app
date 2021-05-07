import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Link from 'next/link';

import { pluralize } from '../utils/ui';
import { fontSize, fontWeight } from '../utils/variables';

import Modal, { ModalTitle } from './Modal';
import MemeImage from './MemeImage';
import Button from './Button';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 50px;
`;

const Thumbnail = styled(MemeImage)`
  max-height: 400px;
  width: auto;
  object-fit: unset;
  margin: 30px 0 20px 0;
  border-radius: 30px;
`;

const Text = styled.p`
  font-size: ${fontSize.m};
  font-weight: ${fontWeight.regular};
`;

const PostPurchaseModal = ({ meme, boughtShards, ...props }) => (
  <Modal {...props}>
    <Wrapper>
      <div className="d-flex flex-column align-items-center">
        <ModalTitle>Your collection is growing</ModalTitle>
        <Thumbnail meme={meme} />
        <Text>{meme.title}</Text>
      </div>

      {boughtShards !== undefined && <Text>You bought {pluralize(boughtShards, 'shard')}</Text>}

      <Link href="/me">
        <Button>View my collection</Button>
      </Link>
    </Wrapper>
  </Modal>
);

PostPurchaseModal.propTypes = {
  meme: PropTypes.object.isRequired,
  boughtShards: PropTypes.number,
};

export default PostPurchaseModal;
