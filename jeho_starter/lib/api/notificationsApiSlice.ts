// lib/api/notificationsApiSlice.ts

import { apiSlice } from './apiSlice';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Notification {
  id:                string;
  notification_type: string;
  title:             string;
  message:           string;
  is_read:           boolean;
  read_at:           string | null;
  link:              string;
  created_at:        string;
  actor?:            string | null;
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // GET /notifications/
    getNotifications: builder.query<Notification[], { unread?: boolean } | void>({
      query: (params) => {
        const unread = (params as any)?.unread;
        return unread ? '/notifications/?unread=true' : '/notifications/';
      },
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: [{ type: 'Notification' as const, id: 'LIST' }],
    }),

    // GET /notifications/unread-count/
    getUnreadCount: builder.query<number, void>({
      query: () => '/notifications/unread-count/',
      transformResponse: (raw: any) => raw?.unread_count ?? 0,
      providesTags: [{ type: 'Notification' as const, id: 'COUNT' }],
    }),

    // POST /notifications/<id>/read/
    markRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read/`, method: 'POST' }),
      invalidatesTags: [
        { type: 'Notification' as const, id: 'LIST' },
        { type: 'Notification' as const, id: 'COUNT' },
      ],
    }),

    // POST /notifications/mark-all-read/
    markAllRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/mark-all-read/', method: 'POST' }),
      invalidatesTags: [
        { type: 'Notification' as const, id: 'LIST' },
        { type: 'Notification' as const, id: 'COUNT' },
      ],
    }),

  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
} = notificationsApiSlice;