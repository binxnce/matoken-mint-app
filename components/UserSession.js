import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getUser, setSdkUser, setWalletProvider } from '../redux/users';
import serviceContext from '../services/serviceContext';

const UserSession = () => {
  const dispatch = useDispatch();
  const { sdkService } = useContext(serviceContext);

  useEffect(() => {
    sdkService
      .restoreSession()
      .then((session) => {
        if (!session || !session?.sdkState?.account) return;
        const {
          sdkState: { account },
          walletProvider,
        } = session;
        setSdkUser(account)(dispatch);
        setWalletProvider(walletProvider)(dispatch);
        getUser()(dispatch);
      })
      .catch(() => sdkService.cleanCachedWallet());
  }, []);

  return <></>;
};

export default UserSession;
