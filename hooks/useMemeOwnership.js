import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadOwnership } from '../redux/ownerships';
import { isLoggedInSelector } from '../redux/selectors';

const useMemeOwnership = (memeId) => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector(isLoggedInSelector);
  const { ownership } = useSelector((state) => state.ownerships);

  useEffect(() => {
    if (isLoggedIn) {
      loadOwnership(memeId)(dispatch);
    }
  }, [dispatch, memeId, isLoggedIn]);

  return ownership;
};

export default useMemeOwnership;
