import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { fontSize, fontWeight } from '../utils/variables';

import Modal, { ModalTitle } from './Modal';
import Button from './Button';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 50px;
`;

const Message = styled.p`
  text-align: center;
  font-size: ${fontSize.xs};
  font-weight: ${fontWeight.regular};
`;

const IntroModal = (props) => {
  const router = useRouter();

  const goToPage = (route) => {
    if (props.onHide) props.onHide();
    router.push(route);
  };

  return (
    <Modal {...props}>
      <Wrapper>
        <ModalTitle>Welcome to MATOKEN Press</ModalTitle>

        {/* intro image */}
        {/* <img src="" alt="" /> */}

        <Message>
          {/* placeholder */}
          Close this window, and then fill out the form, to mint a matoken. Matokens will be stored in the wallet you logged in with, so please make sure you are signed in with the correct account. This service is for legally owned content only, minting unauthoried content is not allowed.
        </Message>

        {/*<Button onClick={() => goToPage('/TODO')}>View Meme of the Day</Button>
        <Button onClick={() => goToPage('/')}>Browse all memes</Button>*/}
      </Wrapper>
    </Modal>
  );
};

IntroModal.propTypes = {
  onHide: PropTypes.func,
};

export default IntroModal;
