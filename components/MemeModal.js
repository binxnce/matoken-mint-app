import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Modal as BootstrapModal, Container, Row, Col } from 'react-bootstrap';
import findIndex from 'lodash/findIndex';

import { memePropType } from '../utils/memes';
import { fontSize } from '../utils/variables';

import MemeView from './MemeView';
import Auth from './Auth';
import BigCloseButton from './BigCloseButton';

// by default, Bootstrap uses z-index:
// - 1040 for modal overlays
// - 1050 for modals
// ( see https://getbootstrap.com/docs/4.0/layout/overview/#z-index )
//
// When multiple modals are opened, this causes all overlays to move beneath
// the windows, instead of separating the top one from the displayed meme page.
// By setting the meme modal content to the same level as overlays, we're
// letting order of appearance decide how to layer them, bringing back the
// correct behaviour.

const BootstrapModalWrapper = styled(BootstrapModal)`
  .memeModal {
    max-width: none;
  }

  .modal-content {
    border: none;
    border-radius: 4px;
    background: none;
  }

  z-index: 1040;
`;

const NavColumn = styled(Col)`
  display: flex;
  align-items: center;
  font-size: ${fontSize.s};
`;

const MemeModal = ({ isShown, meme, onHide, memeList = [] }) => {
  const index = findIndex(memeList, (id) => id === meme?._id);
  const prevMemeId = index !== -1 ? memeList[index - 1] : undefined;
  const nextMemeId = index !== -1 ? memeList[index + 1] : undefined;

  return (
    <BootstrapModalWrapper show={isShown} onHide={onHide} dialogClassName="memeModal">
      <Container>
        <Row className="mb-4">
          <NavColumn>
            <BigCloseButton onClick={onHide} className="mr-auto" />
            <Auth />
          </NavColumn>
        </Row>
        {meme && <MemeView meme={meme} onClose={onHide} prevMemeId={prevMemeId} nextMemeId={nextMemeId} />}
      </Container>
    </BootstrapModalWrapper>
  );
};

MemeModal.propTypes = {
  isShown: PropTypes.bool,
  meme: memePropType,
  onHide: PropTypes.func,
  memeList: PropTypes.arrayOf(PropTypes.string),
};

export default MemeModal;
