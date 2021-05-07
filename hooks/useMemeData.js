import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { loadMeme } from '../redux/memes';
import { fullMemeDataSelector } from '../redux/selectors';

const useMemeData = (id) => {
  const meme = useSelector(fullMemeDataSelector(id));
  const dispatch = useDispatch();

  // ensure reload on first render and id changes
  const initial = useRef(true);
  const prevId = useRef(id);

  useEffect(() => {
    if (prevId.current !== id) {
      prevId.current = id;
      initial.current = true;
    }
  }, [id]);

  useEffect(() => {
    if (id && (!meme || initial.current)) {
      initial.current = false;
      loadMeme(id)(dispatch);
    }
  }, [id, meme]);

  if (meme?.error) return undefined;
  return meme;
};

export default useMemeData;
