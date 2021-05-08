import { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const Me = () => {
  const router = useRouter();
  useEffect(() => {
    router.replace('/me/owned-memes');
  }, []);

  return (
    <Head>
      <title>Profile - Matoken</title>
    </Head>
  );
};

export default Me;
