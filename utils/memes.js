import PropTypes from 'prop-types';

import { get } from './http';
import config from '../config';

export async function fetchFullMemeData(id) {
  const requests = ['', '/owner'].map((path) =>
    get(`${config.apiUrl}/meme/${id}${path}`)
      .catch((error) => {
        if (path !== '') {
          return { data: {} };
        } else {
          throw error;
        }
      })
      .then(({ data }) => data),
  );

  const [{ meme, memePriceChange, priceDataset }, { owner }] = await Promise.all(requests);
  return { meme, memePriceChange, priceDataset, owner };
}

export const joinMemeData = ({ meme, memePriceChange, priceDataset, owner }) => ({
  ...meme,
  memePriceChange,
  priceDataset,
  owner,
});

export const memePropType = PropTypes.shape({
  _id: PropTypes.string,
  title: PropTypes.string,
  availableShards: PropTypes.number,
  maxShards: PropTypes.number,
  priceToBuy: PropTypes.string,
  priceToSell: PropTypes.string,
  owner: PropTypes.shape({
    address: PropTypes.string,
    avatar: PropTypes.shape({
      link: PropTypes.string,
    }),
  }),
  memePriceChange: PropTypes.shape({
    price: PropTypes.string,
    createdAt: PropTypes.string,
  }),
});

export const hasLiquidity = ({ ethLiquidity = '0', memeTokensLiquidity = '0' }) =>
  ethLiquidity !== '0' || memeTokensLiquidity !== '0';
