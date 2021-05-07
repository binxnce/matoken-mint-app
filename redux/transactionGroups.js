import config from '../config';

export const TRANSACTION_GROUPS = 'TRANSACTION_GROUPS';

export const loadTransactionGroups = () => (dispatch) => {
  const url = config.apiUrl + '/me/created-transaction-groups';
  dispatch({ type: 'API', url, success: TRANSACTION_GROUPS });
};

const initialState = {
  transactionGroups: [],
};

export default function transactionGroups(state = initialState, action) {
  switch (action.type) {
    case TRANSACTION_GROUPS:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
}
