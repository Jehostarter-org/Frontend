"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/contexts/auth-context";
import {
  createNotificationSocket,
  type UnsubscribeFn,
} from "@/lib/graphql/client";
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkReadMutation,
  type Notification,
} from "@/lib/api/notificationsApiSlice";

export interface GqlNotification {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
  actor?: { username: string; avatar?: string } | null;
}

interface NotificationContextType {
  notifications: GqlNotification[];
  totalUnreadCount: number;
  isConnected: boolean;
  isLoading: boolean;
  getInboxCount: () => number;
  getNotificationCount: () => number;
  getCommunityCount: () => number;
  refreshNotifications: () => void;
  markAsRead: (
    source: "notifications" | "inbox" | "community",
    id: string,
  ) => Promise<void>;
  markAllAsRead: (
    source: "notifications" | "inbox" | "community",
  ) => Promise<void>;
  addNotification: (
    source: "notifications" | "inbox" | "community",
    item: any,
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const INBOX_TYPES = new Set([
  "community_post",
  "community_invite",
  "mention",
  "comment",
]);

function toContextNotification(n: Notification): GqlNotification {
  return {
    id: n.id,
    notificationType: n.notification_type,
    title: n.title,
    message: n.message,
    isRead: n.is_read,
    link: n.link,
    createdAt: n.created_at,
    actor: n.actor_username ? { username: n.actor_username } : null,
  };
}

function mergeById(items: GqlNotification[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [liveNotifications, setLiveNotifications] = useState<GqlNotification[]>([]);
  const [localInboxUnread, setLocalInboxUnread] = useState(0);
  const [communityUnread, setCommunityUnread] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const unsubRef = useRef<UnsubscribeFn | null>(null);

  const {
    data: restNotifications = [],
    isLoading,
    refetch,
  } = useGetNotificationsQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [markReadRequest] = useMarkReadMutation();
  const [markAllReadRequest] = useMarkAllReadMutation();

  const backendNotifications = useMemo(
    () => restNotifications.map(toContextNotification),
    [restNotifications],
  );

  const notifications = useMemo(
    () => mergeById([...liveNotifications, ...backendNotifications]),
    [liveNotifications, backendNotifications],
  );

  const backendUnread = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const inboxUnread = useMemo(
    () =>
      notifications.filter(
        (n) => !n.isRead && INBOX_TYPES.has(n.notificationType),
      ).length + localInboxUnread,
    [notifications, localInboxUnread],
  );

  const totalUnreadCount = backendUnread + communityUnread;

  const openSocket = useCallback(() => {
    if (!token) return;

    unsubRef.current?.();

    const unsub = createNotificationSocket(
      (event) => {
        if (event.type === "connection_established") {
          setIsConnected(true);
          return;
        }

        if (event.type === "new_notification" && event.payload) {
          const n: GqlNotification = {
            id: event.payload.notification_id,
            notificationType: event.payload.type,
            title: event.payload.title,
            message: event.payload.message,
            isRead: false,
            link: "",
            createdAt: event.payload.created_at,
          };
          setLiveNotifications((prev) => mergeById([n, ...prev]));
        }
      },
      () => setIsConnected(false),
    );

    unsubRef.current = unsub;
  }, [token]);

  React.useEffect(() => {
    if (!user || !token) {
      unsubRef.current?.();
      unsubRef.current = null;
      setLiveNotifications([]);
      setLocalInboxUnread(0);
      setCommunityUnread(0);
      setIsConnected(false);
      return;
    }

    openSocket();

    return () => {
      unsubRef.current?.();
    };
  }, [user, token, openSocket]);

  const refreshNotifications = useCallback(() => {
    if (token) refetch();
  }, [refetch, token]);

  const markAsRead = useCallback(
    async (source: "notifications" | "inbox" | "community", id: string) => {
      if (source === "community") {
        setCommunityUnread((n) => Math.max(0, n - 1));
        return;
      }

      if (source === "inbox") {
        setLocalInboxUnread((n) => Math.max(0, n - 1));
      }

      try {
        await markReadRequest(id).unwrap();
        setLiveNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      } catch (err) {
        console.error("[Notifications] markAsRead failed:", err);
      }
    },
    [markReadRequest],
  );

  const markAllAsRead = useCallback(
    async (source: "notifications" | "inbox" | "community") => {
      if (source === "community") {
        setCommunityUnread(0);
        return;
      }

      if (source === "inbox") {
        setLocalInboxUnread(0);
      }

      try {
        await markAllReadRequest().unwrap();
        setLiveNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("[Notifications] markAllAsRead failed:", err);
      }
    },
    [markAllReadRequest],
  );

  const addNotification = useCallback(
    (source: "notifications" | "inbox" | "community", item: any) => {
      if (source === "community") {
        setCommunityUnread((n) => n + 1);
        return;
      }

      if (source === "inbox") {
        setLocalInboxUnread((n) => n + 1);
      }

      if (source === "notifications") {
        setLiveNotifications((prev) =>
          mergeById([{ ...item, isRead: false }, ...prev]),
        );
      }
    },
    [],
  );

  const getNotificationCount = useCallback(() => backendUnread, [backendUnread]);
  const getInboxCount = useCallback(() => inboxUnread, [inboxUnread]);
  const getCommunityCount = useCallback(() => communityUnread, [communityUnread]);

  const value = useMemo(
    () => ({
      notifications,
      totalUnreadCount,
      isConnected,
      isLoading,
      getInboxCount,
      getNotificationCount,
      getCommunityCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      addNotification,
    }),
    [
      notifications,
      totalUnreadCount,
      isConnected,
      isLoading,
      getInboxCount,
      getNotificationCount,
      getCommunityCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      addNotification,
    ],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
}
