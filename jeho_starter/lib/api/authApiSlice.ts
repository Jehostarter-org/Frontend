import { apiSlice } from './apiSlice';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    registerUser: builder.mutation({
      query: (userData) => ({
        url: '/users/register/',
        method: 'POST',
        body: userData,
      }),
    }),

    loginUser: builder.mutation({
      query: (credentials) => ({
        url: '/users/login/',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Uses plain fetch — must NOT go through RTK Query base query
    // because that would attach Authorization header and cause 401
    googleLogin: builder.mutation({
      queryFn: async (credential: string) => {
        try {
          const response = await fetch(`${BASE_URL}/api/users/auth/google/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
          });
          const data = await response.json();
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (err: any) {
          return { error: { status: 'FETCH_ERROR', error: err.message } };
        }
      },
    }),

    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/users/token/refresh/',
        method: 'POST',
        body: { refresh: refreshToken },
      }),
    }),

    getMe: builder.query({
      query: () => '/users/me/',
      providesTags: ['User'],
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/me/',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    uploadAvatar: builder.mutation({
      query: (formData: FormData) => ({
        url: '/users/avatar/',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['User'],
    }),

    acceptTerms: builder.mutation({
      query: () => ({
        url: '/users/accept-terms/',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation({
      query: (data) => ({
        url: '/users/change-password/',
        method: 'POST',
        body: data,
      }),
    }),

    deleteAccount: builder.mutation({
      query: (data) => ({
        url: '/users/delete-account/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useGoogleLoginMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useAcceptTermsMutation,
  useChangePasswordMutation,
  useDeleteAccountMutation,
} = authApiSlice;