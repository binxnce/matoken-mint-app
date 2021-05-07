import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Nav } from 'react-bootstrap';

import serviceContext from '../services/serviceContext';
import { getUser } from '../redux/users';
import { isLoggedInSelector } from '../redux/selectors';
import { TRANSACTION_GROUP_STATUS, WEBSOCKETS_NOTIFICATIONS } from '../utils/constants';
import LinkNavItem from './LinkNavItem';
import BalanceModal from './BalanceModal';
import AccountInfo from './AccountInfo';
import { OpenLoginModalContext } from './LoginModal';

const AccountLink = styled(Nav.Link)`
  margin-left: 2em;
`;

const AuthLoggedOut = () => {
  const openLoginModal = useContext(OpenLoginModalContext);

  return (
    <Nav className="nav-borderless ml-auto">
      <Button variant="dark" onClick={openLoginModal}>
        Start
      </Button>
    </Nav>
  );
};

const AuthLoggedIn = () => {
  const [isModalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Nav className="nav-borderless ml-auto">
        <LinkNavItem className="blueLink" href="/me">
          My collection
        </LinkNavItem>
        <Nav.Item>
          <AccountLink eventKey="account" onClick={() => setModalVisible(true)}>
            <AccountInfo />
          </AccountLink>
        </Nav.Item>
      </Nav>
      <BalanceModal show={isModalVisible} onHide={() => setModalVisible(false)} />
    </>
  );
};

const Auth = () => {
  const dispatch = useDispatch();
  const { notificationService } = useContext(serviceContext);
  const isLoggedIn = useSelector(isLoggedInSelector);

  useEffect(() => {
    function onNewNotification({ notification: { data, type } }) {
      if (type === WEBSOCKETS_NOTIFICATIONS.TRANSACTION_NOTIFICATION && data.status === TRANSACTION_GROUP_STATUS.DONE) {
        getUser()(dispatch);
      }
    }
    notificationService.subscribe(onNewNotification);
    return () => {
      notificationService.unsubscribe(onNewNotification);
    };
  }, []);

  return isLoggedIn ? <AuthLoggedIn /> : <AuthLoggedOut />;
};

export default Auth;
