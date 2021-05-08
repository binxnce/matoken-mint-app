import Head from 'next/head';
import { useState, useMemo } from 'react';
import NProgress from 'nprogress';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'react-infinite-scroll-component';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import config from '../config';
import mixpanel from '../utils/mixpanel';
import { get as getMemes } from '../utils/http';
import { setScroll } from '../redux/scroll';

import MemeModalHandler from './MemeModalHandler';
import MemeCard from './MemeCard';

const MemeGrid = styled.div`
  display: grid;
  justify-content: space-evenly;
  grid-template-columns: 300px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 300px);
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 300px);
    justify-content: space-between;
  }
`;

const MemeFeed = (props) => {
  const dispatch = useDispatch();
  const { category } = props;
  const { memes, more } = props.memesPreloaded;
  const [page, setPage] = useState(0);
  const [dataLength, setDataLength] = useState(memes.length);
  const [isMore, setIsMore] = useState(more);

  const loadItems = async () => {
    const nextPage = page + 1;
    NProgress.start();
    const res = await getMemes(`${config.apiUrl}/more?page=${nextPage}&category=${category || ''}`);
    for (let i = 0; i < res.data.memes.length; i += 1) {
      memes.push(res.data.memes[i]);
    }
    setPage(nextPage);
    setDataLength(memes.length);
    setIsMore(res.data.more);
    mixpanel.track('loadMoreMemes', { nextPage, category });
    NProgress.done();
  };

  const handleScroll = () => {
    setScroll(window.pageYOffset)(dispatch);
  };

  const memeIdList = useMemo(() => memes.map(({ _id }) => _id), [memes]);

  return (
    <>
      <Head>
        <title>Dank web memes</title>
        <meta property="og:title" content="MAtoken Mint" />
        <meta property="og:description" content="Mint your music albums to Polygon" />
        <meta property="og:url" content="" />
        <meta property="og:image" content="logo.svg" />
      </Head>
      <InfiniteScroll
        onScroll={handleScroll}
        next={loadItems}
        hasMore={isMore}
        dataLength={dataLength}
        loader={<p className="text-center font-weight-bold">Loading...</p>}
        hasChildren={dataLength > 0}
      >
        <MemeGrid>
          {memes.map((m, i) => (
            <MemeCard meme={m} key={i} />
          ))}
        </MemeGrid>
      </InfiniteScroll>
      <MemeModalHandler memeList={memeIdList} />
    </>
  );
};

MemeFeed.propTypes = {
  category: PropTypes.string,
  memesPreloaded: PropTypes.object,
};

export default MemeFeed;
