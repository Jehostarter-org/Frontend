"use client";

// components/reuseables/system-alert-banner.tsx
// Shows the 3 most recent unread notifications as alert cards.
// Replaces the hardcoded mock alerts shown in the right sidebar.
// Data comes from the notification-context which is fed by the WebSocket.

import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useNotifications } from "@/components/contexts/notification-context";
import { gqlFetch } from "@/lib/graphql/client";
import { GET_MY_NOTIFICATIONS } from "@/lib/graphql/notifications";
import { useEffect } from "react";
import type { GqlNotification } from "@/components/contexts/notification-context";

// Map notification type → colour + icon
function alertStyle(type?: string): {
  border: string; bg: string; icon: React.ReactNode;
} {
  if (!type) {
    return {
      border: "border-teal-200",
      bg:     "bg-teal-50",
      icon:   <Bell className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />,
    };
  }
  if (type.startsWith("service")) {
    return {
      border: "border-blue-200",
      bg:     "bg-blue-50",
      icon:   <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />,
    };
  }
  if (type === "like" || type === "comment" || type === "mention") {
    return {
      border: "border-green-200",
      bg:     "bg-green-50",
      icon:   <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />,
    };
  }
  if (type.startsWith("membership") || type === "boost_expired") {
    return {
      border: "border-yellow-200",
      bg:     "bg-yellow-50",
      icon:   <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />,
    };
  }
  return {
    border: "border-teal-200",
    bg:     "bg-teal-50",
    icon:   <Bell className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />,
  };
}

export function SystemAlertsBanner() {
  const { notifications: wsNotifications, markAsRead } = useNotifications();
  const [alerts, setAlerts]   = useState<GqlNotification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // On mount fetch the latest unread notifications via GraphQL
  useEffect(() => {
    gqlFetch<{ myNotifications: GqlNotification[] }>(
      GET_MY_NOTIFICATIONS,
      { unreadOnly: true, limit: 5 },
    )
      .then((d) => setAlerts(d.myNotifications ?? []))
      .catch(() => {});
  }, []);

  // When a new notification arrives via WebSocket, prepend it
  useEffect(() => {
    if (wsNotifications.length === 0) return;
    const newest = wsNotifications[0];
    setAlerts((prev) => {
      if (prev.find((a) => a.id === newest.id)) return prev;
      return [newest, ...prev].slice(0, 5);
    });
  }, [wsNotifications]);

  const visible = alerts.filter(
    (a) => !dismissed.has(a.id) && !a.isRead
  ).slice(0, 3);

  const dismiss = async (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    await markAsRead("notifications", id);
  };

  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      {visible.map((alert) => {
        const style = alertStyle(alert.notificationType);
        return (
          <div
            key={alert.id}
            className={`relative flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.bg}`}
          >
            {style.icon}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 leading-snug">
                {alert.title}
              </p>
              {alert.message && (
                <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                  {alert.message}
                </p>
              )}
              {alert.link && (
                <Link
                  href={alert.link}
                  className="text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline mt-1 block"
                >
                  View →
                </Link>
              )}
            </div>
            <button
              onClick={() => dismiss(alert.id)}
              className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}