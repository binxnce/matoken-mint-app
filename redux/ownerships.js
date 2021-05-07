import config from '../config';

export const OWNERSHIP = 'OWNERSHIP';
export const OWNERSHIPS = 'OWNERSHIPS';
export const NO_OWNERSHIP = 'NO_OWNERSHIP';

export const loadOwnership = (memeId) => (dispatch) => {
  const url = config.apiUrl + `/me/memes/${memeId}/ownerships`;
  dispatch({ type: 'API', url, success: OWNERSHIP, error: NO_OWNERSHIP });
};

export const loadOwnerships = () => (dispatch) => {
  const url = config.apiUrl + '/me/ownerships';
  dispatch({ type: 'API', url, success: OWNERSHIPS });
};

const initialState = {
  ownership: undefined,
  ownerships: [],
};

export default function ownerships(state = initialState, action) {
  switch (action.type) {
    case OWNERSHIP:
      return {
        ...state,
        ...action.data,
      };
    case OWNERSHIPS:
      return {
        ...state,
        ...action.data,
      };
    case NO_OWNERSHIP:
      return {
        ...state,
        ownership: undefined,
      };
    default:
      return state;
  }
}
