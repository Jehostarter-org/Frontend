import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({
  // All Django endpoints live at http://127.0.0.1:8000/api/
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api`,

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
});

// Safe wrapper: catches HTML "error page" responses that would cause a
// "Unexpected token '<'" SyntaxError and converts them to a clean error object.
const safeBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  // If the server returned HTML instead of JSON (e.g. backend is down),
  // RTK Query will set result.error with a parse error. We catch it cleanly.
  if (result.error && result.error.status === 'PARSING_ERROR') {
    const body = (result.error as any).data ?? '';
    const isHtml = typeof body === 'string' && body.trimStart().startsWith('<');
    if (isHtml) {
      return {
        error: {
          status: 503,
          data: 'Server unavailable or returned a non-JSON response.',
        } as FetchBaseQueryError,
      };
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: safeBaseQuery,

  // All tag types used across every injected slice.
  // Adding a tag here is required before any slice can use it.
  tagTypes: [
    'User',
    'Notification',
    'Shop',
    'Listing',
    'Product',
    'Community',
    'CommunityMessages',
    'Post',
    'Service',
    'Membership',
    'Plan',
    'Property',
    'Geolocation',
    'MyShop',                  // ← add
    'MyShopApprovalStatus',    // ← add
    'AdminPendingShops',       // ← add
    'AdminShopDetail',         // ← add
    'SavedListing',
  ],

  endpoints: () => ({}),
});
