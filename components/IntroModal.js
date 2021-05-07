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
        <ModalTitle>Welcome to MemeSwap</ModalTitle>

        {/* intro image */}
        {/* <img src="" alt="" /> */}

        <Message>
          {/* placeholder */}
          Commodo ad pariatur ex esse mollit ullamco velit enim deserunt. Esse in aute et tempor et officia aliquip
          reprehenderit occaecat nisi ea nulla eu ullamco. Aute duis laborum irure in excepteur eu reprehenderit
          pariatur consequat amet labore tempor. Officia occaecat cillum qui consectetur. Ipsum anim incididunt
          cupidatat voluptate consectetur esse commodo.
        </Message>

        {/*<Button onClick={() => goToPage('/TODO')}>View Meme of the Day</Button>*/}
        <Button onClick={() => goToPage('/')}>Browse all memes</Button>
      </Wrapper>
    </Modal>
  );
};

IntroModal.propTypes = {
  onHide: PropTypes.func,
};

export default IntroModal;
