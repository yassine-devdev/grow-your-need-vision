/**
 * Authentication Slice
 * Manages authentication state and user data
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoginTime: string | null;
  sessionTimeout: number; // in milliseconds
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  lastLoginTime: null,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Start authentication process
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // Authentication successful
    authSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = new Date().toISOString();
    },
    
    // Authentication failed
    authFailure: (state, action: PayloadAction<string>) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // Logout user
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.lastLoginTime = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    
    // Update user preferences
    updateUserPreferences: (state, action: PayloadAction<Partial<User['preferences']>>) => {
      if (state.user && state.user.preferences) {
        state.user.preferences = { ...state.user.preferences, ...action.payload };
      }
    },
    
    // Set session timeout
    setSessionTimeout: (state, action: PayloadAction<number>) => {
      state.sessionTimeout = action.payload;
    },
    
    // Check session validity
    checkSession: (state) => {
      if (state.lastLoginTime) {
        const now = new Date().getTime();
        const lastLogin = new Date(state.lastLoginTime).getTime();
        const elapsed = now - lastLogin;
        
        if (elapsed > state.sessionTimeout) {
          // Session expired
          state.user = null;
          state.isAuthenticated = false;
          state.error = 'Session expired. Please login again.';
          state.lastLoginTime = null;
        }
      }
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logout,
  clearError,
  updateUserProfile,
  updateUserPreferences,
  setSessionTimeout,
  checkSession,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUserPreferences = (state: { auth: AuthState }) => state.auth.user?.preferences;
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.user?.role === 'admin';

export default authSlice.reducer;