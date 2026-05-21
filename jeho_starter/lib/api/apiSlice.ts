import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    // All Django endpoints live at http://127.0.0.1:8000/api/
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,

    // Attach JWT to every request.
    // On page refresh Redux is EMPTY until hydrateAuth runs in the layout,
    // so the first wave of API calls would all 401 if we only read from Redux.
    // Fallback to localStorage (where setCredentials always writes the token)
    // so requests never go out unauthenticated.
    prepareHeaders: (headers, { getState }) => {
      const reduxToken = (getState() as RootState).auth.token;
      const lsToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('access_token')
          : null;

      const token = reduxToken ?? lsToken;   // prefer Redux, fall back to LS
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  // All tag types used across every injected slice.
  // Adding a tag here is required before any slice can use it.
  tagTypes: [
    'User',
    'Notification',
    'Shop',
    'Listing',
    'Product',
    'Community',
    'Service',
    'Membership',
  ],

  endpoints: () => ({}),
});