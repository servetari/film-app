import axios from 'axios';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  setUserProfile,
} from './AuthActions';

export const login = async (userCredentials, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', userCredentials);
    dispatch(loginSuccess(res.data));
  } catch (err) {
    dispatch(loginFailure());
    throw err;
  }
};

export const refreshCurrentUser = async (dispatch) => {
  try {
    const { data } = await axios.get('http://localhost:5000/api/users/me');
    dispatch(setUserProfile(data));
    return data;
  } catch (err) {
    throw err;
  }
};

export const updateProfile = async (payload, dispatch) => {
  dispatch(updateUserStart());
  try {
    const { data } = await axios.put('http://localhost:5000/api/users/me', payload);
    dispatch(updateUserSuccess(data));
    return data;
  } catch (err) {
    dispatch(updateUserFailure());
    throw err;
  }
};

export const changePassword = async (payload) => {
  const { data } = await axios.put('http://localhost:5000/api/users/me/password', payload);
  return data;
};
