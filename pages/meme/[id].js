import Head from 'next/head';
import Error from 'next/error';
import PropTypes from 'prop-types';

import mixpanel from '../../utils/mixpanel';
import { fetchFullMemeData, joinMemeData, memePropType } from '../../utils/memes';
import config from '../../config';
import useMemeData from '../../hooks/useMemeData';

import MemeView from '../../components/MemeView';

const MemePage = (props) => {
  if (!props.meme) {
    return <Error statusCode={404} />;
  }

  const storeMeme = useMemeData(props.meme._id);
  const meme = storeMeme ?? props.meme;

  const imageLink = meme.filename ? config.storageUrl + meme.link : meme.link;

  return (
    <>
      <Head>
        <title>{meme.title} - Dank web</title>
        <meta property="og:title" content={`${meme.title} - Dank web`} />
        <meta property="og:description" content="Best stonk gang. Best dank web. Memes, funny videos and pics." />
        <meta property="og:url" content={`${config.webUrl}/meme/${meme._id}`} />
        <meta property="og:image" content={`${config.webUrl}${imageLink}`} />
      </Head>
      <MemeView meme={meme} />
    </>
  );
};

export async function getServerSideProps(context) {
  let meme = null;
  try {
    meme = joinMemeData(await fetchFullMemeData(context.params.id));
    mixpanel.track('pageOpen', { path: `/meme/${context.params.id}` });
  } catch (e) {
    context.res.statusCode = 404;
  }
  return { props: { meme } };
}

MemePage.propTypes = {
  meme: memePropType,
  priceDataset: PropTypes.object,
};

export default MemePage;
