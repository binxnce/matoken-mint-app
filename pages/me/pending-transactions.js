import Head from 'next/head';

import ProfileSubpage from '../../components/ProfileSubpage';
import PendingTransactions from '../../components/PendingTransactions';

const ProfilePendingTransactions = () => (
  <>
    <Head>
      <title>Transactions - MemeSwap</title>
    </Head>
    <ProfileSubpage ContentComponent={PendingTransactions} />
  </>
);

export default ProfilePendingTransactions;
