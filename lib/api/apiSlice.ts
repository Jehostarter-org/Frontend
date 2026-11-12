import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000'}/api`,

  prepareHeaders: (headers, { getState }) => {
    const reduxToken = (getState() as RootState).auth.token;
    const lsToken =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

    const token = reduxToken ?? lsToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const safeBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

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

  tagTypes: [
    'User',
    'Notification',
    'Shop',
    'Listing',
    'Product',
    'Community',
    'CommunityMembers',
    'CommunityMessages',
    'Post',
    'Service',
    'Order',
    'AdminOrder',
    'ConnectAccount',
    'Membership',
    'Plan',
    'Property',
    'Geolocation',
    'MyShop',
    'MyShopApprovalStatus',
    'AdminPendingShops',
    'AdminShopDetail',
    'AdminProviders',
    'AdminProviderDetail',
    'AdminEligibility',
    'AdminEligibilityDetail',
    'SavedListing',
    // Messaging
    'Conversation',
    'Message',
  ],

  endpoints: () => ({}),
});