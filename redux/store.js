import { createStore, combineReducers, applyMiddleware } from 'redux';
import NProgress from 'nprogress';
import { createWrapper, HYDRATE } from 'next-redux-wrapper';

import memes from './memes';
import users from './users';
import ownerships from './ownerships';
import history from './history';
import scroll from './scroll';
import transactionGroups from './transactionGroups';
import http from '../utils/http';

const API_STARTED = 'API_STARTED';
const API_SUCCESS = 'API_SUCCESS';
const API_ERROR = 'API_ERROR';

function status(state = { pendingRequests: 0 }, action) {
  switch (action.type) {
    case HYDRATE:
      return { ...state, ...action.payload };
    case API_STARTED:
      NProgress.start();
      return {
        ...state,
        pendingRequests: state.pendingRequests + 1,
      };
    case API_SUCCESS:
      NProgress.done();
      return {
        ...state,
        pendingRequests: state.pendingRequests - 1,
      };
    case API_ERROR:
      NProgress.done();
      return {
        ...state,
        pendingRequests: state.pendingRequests - 1,
        error: action.error,
      };
    default:
      return state;
  }
}

const reducers = combineReducers({
  status,
  memes,
  users,
  ownerships,
  history,
  scroll,
  transactionGroups,
});

const api = ({ dispatch }) => (next) => (action) => {
  next(action);
  if (action.type === 'API') {
    dispatch({ type: API_STARTED });
    const method = (action.method || 'GET').toLowerCase();

    http[method](action.url, action.data).then(
      (res) => {
        if (action.onResponse) action.onResponse({ status: res?.status, data: res?.data || {} });
        if (action.success) {
          const data = { type: action.success, data: res.data };
          dispatch(data);
        }
        dispatch({ type: API_SUCCESS });
      },
      (error) => {
        if (action.error) {
          dispatch({ type: action.error, error });
          dispatch({ type: API_SUCCESS });
          return;
        }
        if (action.onResponse) action.onResponse({ status: error?.status });
        const message = `Http status ${error.status} for ${error.url}`;
        dispatch({ type: API_ERROR, error: message });
        console.error(new Error(message));
      },
    );
  } else if (action.type === 'LOCAL') {
    const data = { type: action.success, data: action.data };
    dispatch(data);
  }
};

const makeStore = (initialState) => createStore(reducers, initialState, applyMiddleware(api));

export default createWrapper(makeStore);
