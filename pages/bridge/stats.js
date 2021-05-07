import React from 'react';
import Head from 'next/head';
import BridgeStats from '../../components/admin/BridgeStats';
import AdminPagesContainer from '../../components/admin/AdminPagesContainer';

const AdminBridgeStats = () => {
  return (
    <>
      <Head>
        <title>Bridge Stats - Dank web</title>
      </Head>
      <AdminPagesContainer ContentComponent={BridgeStats} />
    </>
  );
};

export default AdminBridgeStats;
