"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import EmptyInbox from "@/components/inbox/EmptyInbox";
import MessageItem from "@/components/inbox/MessageItem";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { Search, Loader2, CheckCheck } from "lucide-react";
import { TabButton } from "@/components/reuseables/tabsButton";
import type { Message } from "@/components/types/types";

import {
  useGetNotificationsQuery,
  useMarkReadMutation,
  useMarkAllReadMutation,
  useDismissNotificationMutation,
  type Notification,
} from "@/lib/api/notificationsApiSlice";

// ── Map backend Notification → frontend Message shape ─────────────────────────

function toMessage(n: Notification): Message {
  const isGroupRelated =
    n.notification_type === "community_post" ||
    n.notification_type === "community_message" ||
    n.notification_type === "community_invite" ||
    n.notification_type === "mention";

  const isCommunityRequest = n.notification_type === "community_invite";

  return {
    id: n.id,
    senderId: n.actor ?? "system",
    senderName: n.title,
    senderAvatar: "",                        // backend doesn't send avatar yet
    type: isGroupRelated ? "group" : "direct",
    content: n.message,
    timestamp: new Date(n.created_at).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    isRead: n.is_read,
    unreadCount: n.is_read ? 0 : 1,
    isCommunityRequest: isCommunityRequest,
    link: n.link || undefined,
    href: resolveHref(n),
  };
}

// Resolve the frontend route a notification should deep-link to.
function resolveHref(n: Notification): string | undefined {
  // Support replies go straight to the support chat
  if (n.notification_type === "support_message") {
    return "/support";
  }

  // Direct messages arrive with link like "/messages/{conversationId}/"
  if (n.notification_type === "direct_message") {
    const match = n.link.match(/\/messages\/(\d+)\/?/);
    const conversationId = match?.[1] ?? n.actor;
    return conversationId
      ? `/dashboard/community?conversation=${conversationId}`
      : undefined;
  }

  // Community messages/activity arrive with link like "/dashboard/community?group={groupId}"
  if (n.link) {
    return n.link.startsWith("/") ? n.link : `/${n.link}`;
  }

  return undefined;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Data ───────────────────────────────────────────────────────────────────
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const [dismissNotification] = useDismissNotificationMutation();

  const messages: Message[] = useMemo(
    () => notifications.map(toMessage),
    [notifications]
  );

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.isRead).length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    let result = messages;
    if (activeTab === "unread") result = result.filter((m) => !m.isRead);
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.senderName.toLowerCase().includes(term) ||
          m.content.toLowerCase().includes(term)
      );
    }
    return result;
  }, [activeTab, messages, searchQuery]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAction = async (id: string) => {
    try {
      await markRead(id).unwrap();
    } catch {
      toast.error("Failed to update notification.");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await dismissNotification(id).unwrap();
    } catch {
      toast.error("Failed to dismiss notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#fcfdfe]">
        <header className="bg-white border-b border-gray-100 px-6 py-8 md:px-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Messages
              </h1>
              <p className="text-gray-500 font-medium">
                You have{" "}
                <span className="text-teal-600 font-bold">
                  {unreadCount} unread
                </span>{" "}
                conversations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllRead}
                  variant="outline"
                  className="font-bold rounded-lg px-5 transition-all active:scale-95"
                >
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-auto">
              <TabButton
                active={activeTab === "all"}
                onClick={() => setActiveTab("all")}
                label="All Messages"
              />
              <TabButton
                active={activeTab === "unread"}
                onClick={() => setActiveTab("unread")}
                label="Unread"
                count={unreadCount}
                variant="unread"
              />
            </div>

            <div className="relative w-full lg:max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-6 bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-teal-500/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pb-20">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <EmptyInbox isSearch={!!searchQuery} />
            ) : (
              <div className="grid gap-3">
                {filteredMessages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    onAction={handleAction}
                    onDismiss={handleDismiss}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}