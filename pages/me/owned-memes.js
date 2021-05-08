import Head from 'next/head';

import ProfileSubpage from '../../components/ProfileSubpage';
import OwnedMemes from '../../components/OwnedMemes';

const ProfileOwnedMemes = () => (
  <>
    <Head>
      <title>Owned memes - Matoken</title>
    </Head>
    <ProfileSubpage ContentComponent={OwnedMemes} />
  </>
);

export default ProfileOwnedMemes;
