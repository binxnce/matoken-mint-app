import Head from 'next/head';

import ProfileSubpage from '../../components/ProfileSubpage';
import History from '../../components/History';

const ProfileHistory = () => (
  <>
    <Head>
      <title>History - MemeSwap</title>
    </Head>
    <ProfileSubpage ContentComponent={History} />
  </>
);

export default ProfileHistory;
