import { useEffect, useContext } from 'react';
import socketIOClient from 'socket.io-client';
import { useSelector } from 'react-redux';
import config from '../config';
import serviceContext from '../services/serviceContext';
import { isLoggedInSelector } from '../redux/selectors';

const Websocket = () => {
  const { notificationService } = useContext(serviceContext);
  const isLoggedIn = useSelector(isLoggedInSelector);

  useEffect(() => {
    if (!isLoggedIn) return;

    const socket = socketIOClient(config.socketsServerUrl, { withCredentials: true });
    socket.on('event', (event) => {
      notificationService.putNotification(event);
    });

    return () => {
      return socket.disconnect();
    };
  }, [isLoggedIn]);

  return <></>;
};

export default Websocket;
