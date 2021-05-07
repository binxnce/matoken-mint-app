import config from '../config';
import mixpanel from '../utils/mixpanel';
import { fetchFullMemeData } from '../utils/memes';

export const MEMES = 'MEMES';
export const USER_MEMES = 'USER_MEMES';
export const MEME = 'MEME';
export const CREATE_MEME = 'CREATE_MEME';
export const MEME_BY_ID = 'MEME_BY_ID';
export const MEME_HISTORY = 'MEME_HISTORY';

export const loadMemes = (query) => (dispatch) => {
  const queryString = query
    ? Object.keys(query)
        .map((key) => key + '=' + query[key])
        .join('&')
    : '';
  const url = config.apiUrl + '/more?' + queryString;
  dispatch({ type: 'API', url, success: MEMES });
};

export const loadUserMemes = () => (dispatch) => {
  const url = config.apiUrl + '/me/memes';
  dispatch({ type: 'API', url, success: USER_MEMES });
};

export const loadMeme = (id) => async (dispatch) => {
  mixpanel.track('loadMeme', { _id: id });

  try {
    const data = await fetchFullMemeData(id);
    dispatch({ type: MEME_BY_ID, id, data });
    dispatch({ type: MEME, data: { meme: data.meme } });
  } catch (error) {
    dispatch({ type: MEME_BY_ID, id, data: { error: true } });
  }
};

export const createMeme = (meme, onResponse) => (dispatch) => {
  const url = config.apiUrl + '/meme';
  dispatch({ type: 'API', method: 'POST', url, data: meme, onResponse });
  mixpanel.track('createMeme', {
    title: meme.get('title'),
    tags: meme.get('tags'),
    category: meme.get('category'),
    ethBalance: meme.get('memeTokensLiquidity'),
  });
};

export const updateMeme = (meme, onResponse) => (dispatch) => {
  const url = config.apiUrl + '/meme/update';
  dispatch({ type: 'API', method: 'POST', url, data: meme, onResponse });
};

export const loadMemeHistory = (id) => (dispatch) => {
  dispatch({
    type: 'API',
    url: `${config.apiUrl}/meme/${id}/orders`,
    onResponse: ({ data }) => {
      if (data) dispatch({ type: MEME_HISTORY, data, id });
    },
  });
};

const initialState = {
  userMemes: [],
  memes: [],
  meme: undefined,
  more: false,
  byId: {},
  memeHistory: {},
};

export default function memes(state = initialState, action) {
  switch (action.type) {
    case MEMES:
      return {
        ...state,
        ...action.data,
      };
    case MEME:
      return {
        ...state,
        ...action.data,
      };
    case USER_MEMES:
      return {
        ...state,
        userMemes: action.data.memes,
      };
    case MEME_BY_ID:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.id]: action.data,
        },
      };
    case MEME_HISTORY:
      return {
        ...state,
        memeHistory: {
          ...state.memeHistory,
          [action.id]: action.data.orders,
        },
      };
    default:
      return state;
  }
}
