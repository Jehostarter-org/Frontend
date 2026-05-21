"use client";

// components/contexts/notification-context.tsx
//
// Real-time notification bell powered by the lightweight WebSocket at
// ws://127.0.0.1:8000/ws/notifications/?token=<jwt>
//
// The heavy GraphQL subscription (ws/graphql/) is reserved for full
// notification payloads on the /dashboard/notification page itself.
//
// This context only needs to:
//   - Show the unread count badge on the bell icon
//   - Increment the count when a new notification arrives
//   - Decrement when the user marks one or all read (via GraphQL mutations)

import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo, useRef, ReactNode,
} from 'react';
import { useAuth } from '@/components/contexts/auth-context';
import {
  createNotificationSocket,
  gqlFetch,
  type UnsubscribeFn,
} from '@/lib/graphql/client';
import {
  GET_UNREAD_COUNT,
  MARK_NOTIFICATION_READ,
  MARK_ALL_NOTIFICATIONS_READ,
} from '@/lib/graphql/notifications';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GqlNotification {
  id:               string;
  notificationType: string;
  title:            string;
  message:          string;
  isRead:           boolean;
  link:             string;
  createdAt:        string;
  actor?:           { username: string; avatar?: string } | null;
}

interface NotificationContextType {
  notifications:        GqlNotification[];
  totalUnreadCount:     number;
  isConnected:          boolean;
  getInboxCount:        () => number;
  getNotificationCount: () => number;
  getCommunityCount:    () => number;
  refreshNotifications: () => void;
  markAsRead:           (source: 'notifications' | 'inbox' | 'community', id: string) => void;
  markAllAsRead:        (source: 'notifications' | 'inbox' | 'community') => void;
  addNotification:      (source: 'notifications' | 'inbox' | 'community', item: any) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();

  const [notifications,   setNotifications]   = useState<GqlNotification[]>([]);
  const [backendUnread,   setBackendUnread]    = useState(0);
  const [inboxUnread,     setInboxUnread]      = useState(0);
  const [communityUnread, setCommunityUnread]  = useState(0);
  const [isConnected,     setIsConnected]      = useState(false);

  const unsubRef = useRef<UnsubscribeFn | null>(null);

  const totalUnreadCount = backendUnread + inboxUnread + communityUnread;

  // ── Fetch initial unread count via GraphQL HTTP ───────────────────────────

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const data = await gqlFetch<{ unreadNotificationCount: number }>(GET_UNREAD_COUNT);
      setBackendUnread(data.unreadNotificationCount ?? 0);
    } catch {
      // Silently fail — WS will keep the count updated
    }
  }, [token]);

  // ── Open lightweight WebSocket ────────────────────────────────────────────

  const openSocket = useCallback(() => {
    if (!token) return;
    unsubRef.current?.();

    const unsub = createNotificationSocket(
      (event) => {
        if (event.type === 'connection_established') {
          // Server sends current unread count on connect
          setBackendUnread(event.unread_count ?? 0);
          setIsConnected(true);
        } else if (event.type === 'new_notification' && event.payload) {
          // New notification pushed from Django _broadcast()
          const n: GqlNotification = {
            id:               event.payload.notification_id,
            notificationType: event.payload.type,
            title:            event.payload.title,
            message:          event.payload.message,
            isRead:           false,
            link:             '',
            createdAt:        event.payload.created_at,
          };
          setNotifications((prev) => [n, ...prev]);
          setBackendUnread((c) => c + 1);
        }
      },
      () => setIsConnected(false),
    );

    unsubRef.current = unsub;
    setIsConnected(true);
  }, [token]);

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user || !token) {
      unsubRef.current?.();
      unsubRef.current = null;
      setNotifications([]);
      setBackendUnread(0);
      setInboxUnread(0);
      setCommunityUnread(0);
      setIsConnected(false);
      return;
    }

    fetchUnreadCount();   // immediate HTTP fetch so count shows before WS opens
    openSocket();         // open WebSocket for real-time updates

    return () => {
      unsubRef.current?.();
    };
  }, [user, token]);     // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mark read (GraphQL mutations over HTTP) ───────────────────────────────

  const markAsRead = useCallback(async (
    source: 'notifications' | 'inbox' | 'community',
    id: string,
  ) => {
    if (source === 'notifications') {
      try {
        await gqlFetch(MARK_NOTIFICATION_READ, { notificationId: id });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setBackendUnread((n) => Math.max(0, n - 1));
      } catch (err) {
        console.error('[Notifications] markAsRead failed:', err);
      }
    } else if (source === 'inbox') {
      setInboxUnread((n) => Math.max(0, n - 1));
    } else {
      setCommunityUnread((n) => Math.max(0, n - 1));
    }
  }, []);

  const markAllAsRead = useCallback(async (
    source: 'notifications' | 'inbox' | 'community',
  ) => {
    if (source === 'notifications') {
      try {
        await gqlFetch(MARK_ALL_NOTIFICATIONS_READ);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setBackendUnread(0);
      } catch (err) {
        console.error('[Notifications] markAllAsRead failed:', err);
      }
    } else if (source === 'inbox') {
      setInboxUnread(0);
    } else {
      setCommunityUnread(0);
    }
  }, []);

  // ── Add locally (from community WS or other sources) ─────────────────────

  const addNotification = useCallback((
    source: 'notifications' | 'inbox' | 'community',
    item: any,
  ) => {
    if (source === 'notifications') {
      setNotifications((prev) => [{ ...item, isRead: false }, ...prev]);
      setBackendUnread((n) => n + 1);
    } else if (source === 'inbox') {
      setInboxUnread((n) => n + 1);
    } else {
      setCommunityUnread((n) => n + 1);
    }
  }, []);

  const refreshNotifications = useCallback(() => fetchUnreadCount(), [fetchUnreadCount]);
  const getNotificationCount = useCallback(() => backendUnread,   [backendUnread]);
  const getInboxCount        = useCallback(() => inboxUnread,     [inboxUnread]);
  const getCommunityCount    = useCallback(() => communityUnread, [communityUnread]);

  const value = useMemo(() => ({
    notifications, totalUnreadCount, isConnected,
    getInboxCount, getNotificationCount, getCommunityCount,
    refreshNotifications, markAsRead, markAllAsRead, addNotification,
  }), [
    notifications, totalUnreadCount, isConnected,
    getInboxCount, getNotificationCount, getCommunityCount,
    refreshNotifications, markAsRead, markAllAsRead, addNotification,
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}