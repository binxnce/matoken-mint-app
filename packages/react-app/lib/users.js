export const USER = 'USER';
export const USER_AUTH = 'USER_AUTH';
export const SIGNOUT = 'SIGNOUT';
export const SDK_USER_AUTH = 'SDK_USER_AUTH';
export const SDK_WALLET_PROVIDER = 'SDK_WALLET_PROVIDER';


export const setSdkUser = (account) => (dispatch) => {
  dispatch({ type: SDK_USER_AUTH, data: account });
};

export const setWalletProvider = (walletProvider) => (dispatch) => {
  dispatch({ type: SDK_WALLET_PROVIDER, data: walletProvider });
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