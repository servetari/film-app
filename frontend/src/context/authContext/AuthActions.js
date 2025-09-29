export const loginStart = () => ({
  type: 'LOGIN_START',
});

export const loginSuccess = (user) => ({
  type: 'LOGIN_SUCCESS',
  payload: user,
});

export const loginFailure = () => ({
  type: 'LOGIN_FAILURE',
});

export const updateUserStart = () => ({
  type: 'UPDATE_USER_START',
});

export const updateUserSuccess = (user) => ({
  type: 'UPDATE_USER_SUCCESS',
  payload: user,
});

export const updateUserFailure = () => ({
  type: 'UPDATE_USER_FAILURE',
});

export const setUserProfile = (user) => ({
  type: 'SET_USER_PROFILE',
  payload: user,
});

export const logout = () => ({
  type: 'LOGOUT',
});
