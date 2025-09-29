const AuthReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case 'LOGIN_SUCCESS':
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case 'LOGIN_FAILURE':
      return {
        user: null,
        isFetching: false,
        error: true,
      };
    case 'UPDATE_USER_START':
      return {
        ...state,
        isFetching: true,
        error: false,
      };
    case 'UPDATE_USER_SUCCESS': {
      const existing = state.user || {};
      return {
        user: { ...existing, user: action.payload },
        isFetching: false,
        error: false,
      };
    }
    case 'UPDATE_USER_FAILURE':
      return {
        ...state,
        isFetching: false,
        error: true,
      };
    case 'SET_USER_PROFILE': {
      const existing = state.user || {};
      return {
        ...state,
        user: { ...existing, user: action.payload },
      };
    }
    case 'LOGOUT':
      return {
        user: null,
        isFetching: false,
        error: false,
      };
    default:
      return { ...state };
  }
};

export default AuthReducer;
