import { useState, useEffect } from 'react';

import config from '../config';
import http from '../utils/http';

const useMemeTokenReserve = (memeId) => {
  const [memeTokenReserve, setMemeTokenReserve] = useState(null);

  useEffect(() => {
    if (memeTokenReserve === null) {
      http.get(`${config.apiUrl}/meme/${memeId}/reserves`).then((res) => {
        setMemeTokenReserve(res.data.memeTokenReserve);
      });
    }
  }, [memeId, memeTokenReserve]);

  return memeTokenReserve;
};

export default useMemeTokenReserve;
