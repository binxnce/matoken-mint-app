import config from '../config';

export const HISTORY = 'HISTORY';

export const loadHistory = () => (dispatch) => {
  const url = config.apiUrl + '/me/history';
  dispatch({ type: 'API', url, success: HISTORY });
};

const initialState = {
  history: [],
};

export default function history(state = initialState, action) {
  switch (action.type) {
    case HISTORY:
      return {
        ...state,
        ...action.data,
      };
    default:
      return state;
  }
}
