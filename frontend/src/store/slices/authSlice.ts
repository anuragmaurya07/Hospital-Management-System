import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';

interface AuthState {
  user: User | null;
  profile: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  profile: null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; profile?: any; accessToken: string; refreshToken?: string }>
    ) => {
      state.user = action.payload.user;
      state.profile = action.payload.profile || null;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, setProfile, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
