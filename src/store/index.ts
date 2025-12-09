/**
 * Global State Management
 * Redux Toolkit store configuration with all slices and middleware
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import mediaSlice from './slices/mediaSlice';
import marketSlice from './slices/marketSlice';
import notificationSlice from './slices/notificationSlice';
import settingsSlice from './slices/settingsSlice';

// Import API slices
import { authApi } from './api/authApi';
import { mediaApi } from './api/mediaApi';
import { marketApi } from './api/marketApi';
import { userApi } from './api/userApi';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'], // Only persist these slices
  blacklist: ['ui', 'notifications'] // Don't persist these slices
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  media: mediaSlice,
  market: marketSlice,
  notifications: notificationSlice,
  settings: settingsSlice,
  // API reducers
  [authApi.reducerPath]: authApi.reducer,
  [mediaApi.reducerPath]: mediaApi.reducer,
  [marketApi.reducerPath]: marketApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['register'],
      },
    })
      .concat(authApi.middleware)
      .concat(mediaApi.middleware)
      .concat(marketApi.middleware)
      .concat(userApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export hooks for typed usage
export { useAppDispatch, useAppSelector } from './hooks';