import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Countdown = ({ secondsLeft, expiredText, onExpired }) => {
  const [seconds, setSeconds] = useState(secondsLeft);

  useEffect(() => {
    const expireAt = +new Date() + secondsLeft * 1000;

    const interval = setInterval(() => {
      const now = +new Date();
      const left = (expireAt - now) / 1000;
      setSeconds(left);
      if (left <= 1) {
        clearInterval(interval);
        onExpired && onExpired();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  if (seconds <= 0) return expiredText;

  return new Date(seconds * 1000).toUTCString().match(/(\d\d:\d\d:\d\d)/)[0];
};

Countdown.propTypes = {
  secondsLeft: PropTypes.number.isRequired,
  expiredText: PropTypes.string,
  onExpired: PropTypes.func,
};

export default Countdown;
