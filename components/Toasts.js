import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { Toast } from 'react-bootstrap';
import styled from 'styled-components';
import { WEBSOCKETS_NOTIFICATIONS, TRANSACTION_GROUP_STATUS } from '../utils/constants';
import serviceContext from '../services/serviceContext';

const devMode = false;
const supportedNotifications = Object.values(WEBSOCKETS_NOTIFICATIONS);
const { DONE, FAILED } = TRANSACTION_GROUP_STATUS;
const { TRANSACTION_NOTIFICATION } = WEBSOCKETS_NOTIFICATIONS;

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1100;
`;

const Notifications = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  z-index: 1100;
`;

const Toasts = () => {
  const { notificationService } = useContext(serviceContext);
  const displayedNotifications = useRef({});
  const [displayNotifications, setDisplayNotifications] = useState([]);

  const onNewNotification = useCallback((newNotification) => {
    const {
      id,
      notification: { type, data },
    } = newNotification;

    if (
      displayedNotifications.current[id] ||
      !supportedNotifications.includes(type) ||
      !getNotificationMessage(type, data)
    )
      return;

    const timer = setTimeout(closeNotification(id), 3000);
    displayedNotifications.current[id] = timer;

    setDisplayNotifications((notifications) => [...notifications, newNotification]);
  }, []);

  useEffect(() => {
    notificationService.subscribe(onNewNotification);

    return () => {
      notificationService.unsubscribe(onNewNotification);
      Object.values(displayedNotifications.current).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  const addNotification = (notification) => {
    notificationService.putNotification(notification);
  };

  const closeNotification = (notificationId) => () => {
    setDisplayNotifications((notifications) => notifications.filter(({ id }) => notificationId !== id));
  };

  const devAddNotification = () => {
    const notification = {
      type: WEBSOCKETS_NOTIFICATIONS.DEV,
      data: {
        message: `hello ${Math.random()}`,
      },
    };
    addNotification(notification);
  };

  const getNotificationMessage = (type, data) => {
    switch (type) {
      case TRANSACTION_NOTIFICATION:
        if (![DONE, FAILED].includes(data.status)) return '';
        return data.status === DONE ? 'Transaction completed!' : 'Transaction failed';

      case WEBSOCKETS_NOTIFICATIONS.DEV:
        return data.message;
    }
    return type;
  };

  const getNotificationColor = (type, data) => {
    if (type === TRANSACTION_NOTIFICATION && data.status === FAILED) {
      return 'red';
    }
    return 'yellow';
  };

  return (
    <Wrapper aria-live="polite" aria-atomic="true">
      <Notifications>
        {displayNotifications.map(({ id, notification: { type, data } }, i) => (
          <Toast key={i} onClose={closeNotification(id)} style={{ backgroundColor: getNotificationColor(type, data) }}>
            <Toast.Header>{getNotificationMessage(type, data)}</Toast.Header>
          </Toast>
        ))}
      </Notifications>

      {devMode && (
        <div>
          <br />
          <br />
          <br />
          <button onClick={devAddNotification}>Add Notification</button>
        </div>
      )}
    </Wrapper>
  );
};

export default Toasts;
