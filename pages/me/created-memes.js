import Head from 'next/head';

import ProfileSubpage from '../../components/ProfileSubpage';
import CreatedMemes from '../../components/CreatedMemes';

const ProfileCreatedMemes = () => (
  <>
    <Head>
      <title>Created memes - matokenswap</title>
    </Head>
    <ProfileSubpage ContentComponent={CreatedMemes} />
  </>
);

export default ProfileCreatedMemes;
