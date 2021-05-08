import React, { useState, useCallback } from 'react';
import { Container } from 'react-bootstrap';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import useFacebook from '../hooks/useFacebook';
import AppNav from './AppNav';
import Footer from './Footer';
import Meta from './Meta';
{/*import CreateMemeModal from './CreateMemeModal';*/}
import LoginModal, { OpenLoginModalContext } from './LoginModal';
import Websocket from './Websocket';
import Toasts from './Toasts';
import UserSession from './UserSession';

const MainWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: hidden;
`;

const ContentWrapper = styled.div`
  padding-top: 20px;
`;

const Page = (props) => {
  const [isLoginModalShown, setIsLoginModalShown] = useState(false);
  const openLoginModal = useCallback(() => setIsLoginModalShown(true), []);
  useFacebook();

  return (
    <>
      <UserSession />
      <Meta />
      <Websocket />
      <Toasts />
      <OpenLoginModalContext.Provider value={openLoginModal}>
        <MainWrapper>
          <Container>
            <AppNav />
            <ContentWrapper>{props.children}</ContentWrapper>
          </Container>
          <Footer className="mt-auto" />
          {/*<CreateMemeModal />*/}
          <LoginModal show={isLoginModalShown} onHide={() => setIsLoginModalShown(false)} />
        </MainWrapper>
      </OpenLoginModalContext.Provider>
      <script
        src="https://code.jquery.com/jquery-2.2.4.min.js"
        integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
        crossOrigin="anonymous"
      ></script>
      <script src="/js/bootstrap/bootstrap.bundle.min.js"></script>
    </>
  );
};

Page.propTypes = {
  children: PropTypes.object,
};

export default Page;
