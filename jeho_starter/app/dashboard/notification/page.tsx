"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Bell, MessageSquare, Heart, ShoppingCart,
  User, Inbox, Trash2, BellOff, MoreVertical, Loader2,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, type GqlNotification } from "@/components/contexts/notification-context";
import { gqlFetch } from "@/lib/graphql/client";
import { GET_MY_NOTIFICATIONS } from "@/lib/graphql/notifications";
import { formatDistanceToNow } from "date-fns";

// ── Icon map ──────────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case "comment":          return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "like":             return <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />;
    case "shop_inquiry":     return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
    case "service_accepted":
    case "service_updated":
    case "service_completed":
    case "service_cancelled": return <Bell className="w-4 h-4 text-amber-500" />;
    default:                 return <User className="w-4 h-4 text-slate-400" />;
  }
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

// ── Notification item ─────────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: GqlNotification;
  onMarkRead: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${
        notification.isRead
          ? "bg-white/50 border-slate-100 grayscale-[0.5]"
          : "bg-white border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/50"
      }`}
    >
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-2xl" />
      )}

      {/* Avatar */}
      <div className="relative h-12 w-12 flex-shrink-0">
        <div className="h-full w-full overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm">
          {notification.actor?.avatar ? (
            <Image
              src={notification.actor.avatar}
              alt={notification.actor.username}
              width={48} height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-teal-50 text-teal-600 font-bold text-lg">
              {notification.actor?.username?.charAt(0).toUpperCase() ?? "J"}
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md ring-1 ring-slate-100">
          <NotifIcon type={notification.notificationType} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className={`text-sm leading-snug ${notification.isRead ? "text-slate-500" : "text-slate-900 font-bold"}`}>
            {notification.title}
          </p>
          <span className="text-[10px] font-black text-slate-300 whitespace-nowrap pt-0.5 uppercase tracking-tighter">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {notification.message && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50">
            <p className="text-xs text-slate-600 font-medium italic">
              {notification.message}
            </p>
          </div>
        )}

        {notification.link && (
          <a
            href={notification.link}
            className="mt-2 inline-block text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline"
          >
            View →
          </a>
        )}

        {!notification.isRead && (
          <button
            onClick={onMarkRead}
            className="mt-2 block text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
          >
            Mark as read
          </button>
        )}
      </div>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-slate-100 shadow-xl">
          <DropdownMenuItem
            onClick={onDelete}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 size={14} /> Delete
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <BellOff size={14} /> Mute
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
      <div className="bg-slate-50 p-8 rounded-full mb-6">
        <Inbox className="w-12 h-12 text-slate-200" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        {isFiltered ? "No unread alerts" : "Quiet in here..."}
      </h3>
      <p className="text-slate-400 text-sm mt-1">
        {isFiltered ? "You've handled everything!" : "We'll let you know when things happen."}
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NotificationPage() {
  const { markAsRead, markAllAsRead } = useNotifications();

  const [filter,        setFilter]        = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState<GqlNotification[]>([]);
  const [isLoading,     setIsLoading]     = useState(true);

  // Fetch full notification list from GraphQL on mount
  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const data = await gqlFetch<{ myNotifications: GqlNotification[] }>(
          GET_MY_NOTIFICATIONS,
          { unreadOnly: false, limit: 50 },
        );
        setNotifications(data.myNotifications ?? []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications],
  );

  const filtered = useMemo(
    () => filter === "all" ? notifications : notifications.filter((n) => !n.isRead),
    [filter, notifications],
  );

  const handleMarkRead = async (id: string) => {
    await markAsRead("notifications", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead("notifications");
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: string) => {
    // Optimistic remove — no delete endpoint yet, just hide locally
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="max-w-3xl mx-auto p-4 md:p-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activity</h1>
              <p className="text-slate-500 font-medium">
                You have{" "}
                <span className="text-teal-600 font-bold">{unreadCount} unread</span>{" "}
                notifications
              </p>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-black text-teal-600 uppercase tracking-widest hover:text-teal-700"
                >
                  Mark all read
                </button>
              )}
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                {(["all", "unread"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      filter === f
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-slate-400 text-sm">Loading notifications...</p>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState isFiltered={filter === "unread"} />
          ) : (
            <div className="space-y-4">
              {filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={() => handleMarkRead(n.id)}
                  onDelete={() => handleDelete(n.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </DashboardShell>
  );
}