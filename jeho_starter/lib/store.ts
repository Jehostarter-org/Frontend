// /lib/store.ts or wherever your store is configured

import { apiSlice } from './api/apiSlice';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from "./features/auth/authSlice";
import '@/lib/api/savedListingsApiSlice';
import '@/lib/api/communityApiSlice';
import { propertyApi } from './api/propertyApiSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [propertyApi.reducerPath]: propertyApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }).concat(
      apiSlice.middleware,
      propertyApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;