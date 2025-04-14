import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.error = null;
      authAPI.logout();
    },
  },
});

export const { setAuthenticated, setLoading, setError, logout } = authSlice.actions;

// Thunks
export const loginUser = (email: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    await authAPI.login(email, password);
    dispatch(setAuthenticated(true));
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Login failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const registerUser = (email: string, password: string) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    await authAPI.register(email, password);
    dispatch(setError(null));
  } catch (error) {
    dispatch(setError('Registration failed'));
  } finally {
    dispatch(setLoading(false));
  }
};

export const checkAuth = () => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));
    await authAPI.validate();
    dispatch(setAuthenticated(true));
  } catch (error) {
    dispatch(setAuthenticated(false));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer; 