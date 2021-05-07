import config from '../config';
import mixpanel from '../utils/mixpanel';
import { fromWei } from '../utils/transactions';

export const USER = 'USER';
export const USER_AUTH = 'USER_AUTH';
export const SIGNOUT = 'SIGNOUT';
export const SDK_USER_AUTH = 'SDK_USER_AUTH';
export const SDK_WALLET_PROVIDER = 'SDK_WALLET_PROVIDER';

export const getUser = () => (dispatch) => {
  const url = config.apiUrl + '/me';
  dispatch({ type: 'API', url, success: USER });
};

export const signOutUser = () => (dispatch) => {
  const url = config.apiUrl + '/signout';
  dispatch({ type: 'API', url, success: SIGNOUT });
};

export const setSdkUser = (account) => (dispatch) => {
  dispatch({ type: SDK_USER_AUTH, data: account });
};

export const setWalletProvider = (walletProvider) => (dispatch) => {
  dispatch({ type: SDK_WALLET_PROVIDER, data: walletProvider });
};

const extend = (user) => {
  if (user) {
    const ethBalanceFormatted = user.ethBalance ? fromWei(user.ethBalance) : '0';

    mixpanel.identify(user._id);

    mixpanel.people.set_once({
      'First Login Date': new Date(),
      USER_ID: user._id,
    });

    mixpanel.people.set({
      $name: user.name,
      $last_seen: new Date(),
      USER_ID: user._id,
      credits: ethBalanceFormatted,
    });

    return {
      ...user,
      avatarUrl: (user.avatar?.filename ? config.storageUrl : '') + user.avatar?.link,
      ethBalanceFormatted,
    };
  }
  return undefined;
};

const User = (state = {}, action) => {
  switch (action.type) {
    case USER:
      return {
        ...state,
        current: extend(action.data),
      };
    case USER_AUTH:
      return {
        ...state,
        current: extend(action.data),
      };
    case SDK_USER_AUTH:
      return {
        ...state,
        sdkUser: action.data,
      };
    case SDK_WALLET_PROVIDER:
      return {
        ...state,
        walletProvider: action.data,
      };
    case SIGNOUT:
      return {
        ...state,
        current: undefined,
        sdkUser: undefined,
        walletProvider: undefined,
      };
    default:
      return state;
  }
};

export default User;
