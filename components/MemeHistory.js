import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import moment from 'moment';

import config from '../config';
import { loadMemeHistory } from '../redux/memes';
import { fromWei, weiToShards } from '../utils/transactions';
import { formatCurrency, pluralize } from '../utils/ui';
import { colors } from '../utils/variables';

import TableListEntry from './TableListEntry';

const EntryDate = styled.p`
  font-size: 0.8em;
  color: ${colors.secondaryText};
`;

const Entry = ({ action, user, numberOfShards, ethAmount, transactionGroup }) => {
  const verb = {
    BUY: 'bought',
    SELL: 'sold',
  }[action];

  if (!verb) return null;

  return (
    <TableListEntry>
      <p>
        User <strong>{user.name}</strong> {verb} <strong>{pluralize(numberOfShards, 'shard')}</strong> for{' '}
        {formatCurrency(fromWei(ethAmount), config.currencySymbol)}
      </p>
      <EntryDate>
        {moment(transactionGroup.updatedAt)
          .utc(true)
          .format('MMMM DD YYYY H:mm')}
      </EntryDate>
    </TableListEntry>
  );
};

Entry.propTypes = {
  action: PropTypes.oneOf(['BUY', 'SELL']).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  numberOfShards: PropTypes.number.isRequired,
  ethAmount: PropTypes.string.isRequired,
  transactionGroup: PropTypes.shape({
    updatedAt: PropTypes.string.isRequired,
  }).isRequired,
};

const HistoryTitle = styled.h2`
  font-size: 1.2em;
  margin-bottom: 1em;
`;

const MemeHistory = ({ meme }) => {
  const dispatch = useDispatch();

  const entries = useSelector(({ memes: { memeHistory } }) =>
    memeHistory[meme._id]?.map((data) => ({
      ...data,
      numberOfShards: weiToShards(data.memeTokensAmount, meme.maxShards),
    })),
  );

  useEffect(() => {
    loadMemeHistory(meme._id)(dispatch);
  }, [meme._id]);

  if (!entries || entries.length <= 0) return null;

  return (
    <div>
      <HistoryTitle>Recent transactions</HistoryTitle>
      {entries.map((data) => (
        <Entry key={data._id} {...data} />
      ))}
    </div>
  );
};

MemeHistory.propTypes = {
  meme: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    maxShards: PropTypes.number.isRequired,
  }).isRequired,
};

export default MemeHistory;
