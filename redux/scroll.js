export const SCROLL = 'SCROLL';

export const setScroll = (data) => (dispatch) => {
  dispatch({ type: 'LOCAL', data, success: SCROLL });
};

const scroll = (state = { scroll: 0 }, action) => {
  switch (action.type) {
    case SCROLL:
      return {
        ...state,
        scroll: action.data,
      };

    default:
      return state;
  }
};

export default scroll;
