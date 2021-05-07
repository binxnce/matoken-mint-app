import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { loadOwnerships, loadOwnership } from '../redux/ownerships';
import { loadUserMemes, loadMeme } from '../redux/memes';
import { isLoggedInSelector } from '../redux/selectors';
import serviceContext from '../services/serviceContext';
import { WEBSOCKETS_NOTIFICATIONS } from '../utils/constants';
import { colors } from '../utils/variables';
import http from '../utils/http';
import config from '../config';

import MemeInfoCard from './MemeInfoCard';
import MemeLiquidityModal from './MemeLiquidityModal';
import MemeModalHandler from './MemeModalHandler';
import EditMemeModal from './EditMemeModal';
import Button from './NeonButton';
import ButtonGroup from './ButtonGroup';

const Filter = styled.a`
  font-weight: normal;
  color: ${colors.text};
  &:hover {
    color: inherit;
  }
`;

const userMemesSelector = ({ memes: { userMemes }, ownerships: { ownerships } }) =>
  userMemes &&
  userMemes.map((meme) => {
    const ownedMemeInfo = ownerships.find(({ meme: ownedMeme }) => ownedMeme?._id === meme._id);
    if (ownedMemeInfo) {
      const { liquidityTokens, memeTokens } = ownedMemeInfo;
      const updatedMeme = { ...meme };
      if (liquidityTokens) updatedMeme.liquidityTokens = liquidityTokens;
      if (memeTokens) updatedMeme.memeTokens = memeTokens;
      return updatedMeme;
    }
    return meme;
  });

const CreatedMemes = () => {
  const dispatch = useDispatch();
  const { notificationService } = useContext(serviceContext);
  const isLoggedIn = useSelector(isLoggedInSelector);
  const userMemes = useSelector(userMemesSelector);
  const liquidityModalData = useSelector(
    ({ users: { current: user }, ownerships: { ownership }, memes: { meme } }) =>
      !!(user && ownership && meme) && { user, ownership, meme },
  );
  const router = useRouter();

  const [isLiquidityModalShown, setIsLiquidityModalShown] = useState(false);
  const [isEditMemeModalShown, setIsEditMemeModalShown] = useState(false);
  const [memeId, setMemeId] = useState(undefined);
  const [showArchived, setShowArchived] = useState(false);

  const refresh = () => {
    loadOwnerships()(dispatch);
    loadUserMemes()(dispatch);
  };

  useEffect(refresh, []);

  useEffect(() => {
    function onNewNotification({ notification }) {
      if (notification.type === WEBSOCKETS_NOTIFICATIONS.TRANSACTION_NOTIFICATION) {
        refresh();
      }
    }
    notificationService.subscribe(onNewNotification);
    return () => {
      notificationService.unsubscribe(onNewNotification);
    };
  }, []);

  const showLiquidityModal = (memeId) => {
    if (!isLoggedIn) {
      return;
    }
    loadMeme(memeId)(dispatch);
    loadOwnership(memeId)(dispatch);
    setIsLiquidityModalShown(true);
  };

  const showEditMemeModal = (memeId) => {
    if (!isLoggedIn) {
      return;
    }
    setMemeId(memeId);
    setIsEditMemeModalShown(true);
  };

  const handleRemoveLiuidityFromAll = () => {
    http
      .post(`${config.apiUrl}/meme/remove-liquidity-from-all-memes`)
      .then(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        router.push('/me/pending-transactions');
      })
      .catch((e) => alert(e?.data?.error?.message || 'unexpected error'));
  };

  const memeIdList = useMemo(() => userMemes?.map((meme) => meme._id), [userMemes]);
  const numArchived = useMemo(() => (userMemes || []).filter(({ isArchived }) => isArchived).length, [userMemes]);
  const numNotArchived = userMemes.length - numArchived;

  if (!userMemes || userMemes.length === 0) {
    return (
      <div className="text-center mt-3 noOwnedMemes">
        <p>No memes created :(</p>
      </div>
    );
  }

  return (
    <>
      {(numArchived > 0 || showArchived) && (
        <div className="d-flex">
          <div className="ml-auto p-2">
            <Filter
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setShowArchived(!showArchived);
              }}
            >
              {showArchived ? `Show non archived (${numNotArchived})` : `Show archived (${numArchived})`}
            </Filter>
          </div>
        </div>
      )}
      {userMemes
        .filter((o) => (!showArchived && !o.isArchived) || (showArchived && o.isArchived))
        .map((meme) => (
          <MemeInfoCard
            {...meme}
            key={`MemeInfoCard-${meme._id}`}
            manageLiquidity={() => showLiquidityModal(meme._id)}
            editMemeDetails={() => showEditMemeModal(meme._id)}
            toTransactions={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              router.push('/me/pending-transactions');
            }}
          />
        ))}
      {!!userMemes.length && (
        <ButtonGroup center style={{ marginTop: '70px', marginBottom: '20px' }}>
          <Button danger text="Remove liquidity from all created memes" onClick={handleRemoveLiuidityFromAll} />
        </ButtonGroup>
      )}
      {!!liquidityModalData && (
        <MemeLiquidityModal
          {...liquidityModalData}
          isShown={isLiquidityModalShown}
          onHide={() => setIsLiquidityModalShown(false)}
        />
      )}
      {!!memeId && (
        <EditMemeModal
          memeId={memeId}
          isShown={isEditMemeModalShown}
          onHide={(updated) => {
            if (updated) {
              refresh();
            }
            setIsEditMemeModalShown(false);
          }}
        />
      )}
      <MemeModalHandler memeList={memeIdList} />
    </>
  );
};

export default CreatedMemes;
