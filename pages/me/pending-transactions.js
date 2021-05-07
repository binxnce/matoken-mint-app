import Head from 'next/head';

import ProfileSubpage from '../../components/ProfileSubpage';
import PendingTransactions from '../../components/PendingTransactions';

const ProfilePendingTransactions = () => (
  <>
    <Head>
      <title>Transactions - matokenswap</title>
    </Head>
    <ProfileSubpage ContentComponent={PendingTransactions} />
  </>
);

export default ProfilePendingTransactions;
