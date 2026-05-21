import { apiSlice } from './apiSlice';

// Django notification endpoints (notifications/urls.py):
//   GET  /api/notifications/               — list all, ?unread=true for unread only
//   GET  /api/notifications/unread-count/  — { unread_count: N }
//   POST /api/notifications/mark-all-read/ — marks everything read
//   POST /api/notifications/<pk>/read/     — marks one notification read

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /api/notifications/unread-count/
    // Polled every 30s by notification-context.tsx
    getUnreadNotificationCount: builder.query<{ unread_count: number }, void>({
      query: () => '/notifications/unread-count/',
      providesTags: ['Notification'],
    }),

    // GET /api/notifications/
    // Pass { unread: true } to fetch only unread ones
    getNotifications: builder.query<any[], { unread?: boolean } | void>({
      query: (params) => {
        const qs = params?.unread ? '?unread=true' : '';
        return `/notifications/${qs}`;
      },
      providesTags: ['Notification'],
    }),

    // POST /api/notifications/mark-all-read/
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/mark-all-read/',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),

    // POST /api/notifications/<pk>/read/
    markNotificationRead: builder.mutation<void, string>({
      query: (pk) => ({
        url: `/notifications/${pk}/read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetUnreadNotificationCountQuery,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} = notificationsApiSlice;