import React from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import omit from 'lodash/omit';

import useMemeData from '../hooks/useMemeData';
import MemeModal from './MemeModal';

const MemeModalHandler = ({ memeList }) => {
  const router = useRouter();
  const { query, pathname } = router;
  const meme = useMemeData(query.memePopup);

  return (
    <MemeModal
      meme={meme}
      isShown={!!query.memePopup}
      onHide={() => router.push({ pathname, query: omit(query, 'memePopup') })}
      memeList={memeList}
    />
  );
};

MemeModalHandler.propTypes = {
  memeList: PropTypes.arrayOf(PropTypes.string),
};

export default MemeModalHandler;
