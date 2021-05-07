import React, { useContext, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import noop from 'lodash/noop';

import serviceContext from '../services/serviceContext';
import { WEBSOCKETS_NOTIFICATIONS } from '../utils/constants';
import { loadOwnerships } from '../redux/ownerships';
import { loadUserMemes } from '../redux/memes';

import MemeInfoCard from './MemeInfoCard';
import MemeModalHandler from './MemeModalHandler';

const ownedMemesSelector = ({ ownerships: { ownerships }, memes: { userMemes } }) =>
  ownerships &&
  ownerships
    .map((o) => {
      const { meme: currentMemeData = {}, memeTokens, liquidityTokens, ...ownershipInfo } = o;
      const userMeme = userMemes.find(({ _id }) => _id === currentMemeData?._id);

      if (userMeme) {
        return {
          ownership: ownershipInfo,
          ...userMeme,
          memeTokens,
          liquidityTokens,
        };
      }

      if (!currentMemeData || currentMemeData.isArchived) {
        return null;
      }

      return {
        ownership: ownershipInfo,
        ...currentMemeData,
        enabled: true,
        memeTokens,
        liquidityTokens,
      };
    })
    .filter(Boolean);

const OwnedMemes = () => {
  const dispatch = useDispatch();
  const { notificationService } = useContext(serviceContext);
  const ownedMemes = useSelector(ownedMemesSelector);
  const router = useRouter();

  useEffect(() => {
    loadOwnerships()(dispatch);
    loadUserMemes()(dispatch);

    function onNewNotification({ notification }) {
      if (notification.type === WEBSOCKETS_NOTIFICATIONS.TRANSACTION_NOTIFICATION) {
        loadOwnerships()(dispatch);
        loadUserMemes()(dispatch);
      }
    }
    notificationService.subscribe(onNewNotification);
    return () => {
      notificationService.unsubscribe(onNewNotification);
    };
  }, []);

  const memeIdList = useMemo(() => ownedMemes?.map((meme) => meme._id), [ownedMemes]);

  if (!ownedMemes || ownedMemes.length === 0) {
    return (
      <div className="text-center mt-3 noOwnedMemes">
        <p>You don&apos;t own any memes</p>
        <p>PRO TIP</p>
        <p>
          Collect a few shards from nearly sold out memes.
          <br />
          They will likely to increase in price once the whole NFT is sold.
        </p>
        <p>
          <a className="btn btn-primary" href="/?filter=nearly-sold">
            View Nearly Sold Out
          </a>
        </p>
      </div>
    );
  }

  return (
    <>
      {ownedMemes.map((o) => (
        <MemeInfoCard
          {...o}
          key={`meme${o._id}`}
          manageLiquidity={noop}
          toTransactions={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            router.push('/me/pending-transactions');
          }}
        />
      ))}
      <MemeModalHandler memeList={memeIdList} />
    </>
  );
};

export default OwnedMemes;
