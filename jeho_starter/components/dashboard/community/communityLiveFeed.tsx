"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import CommunityWidget from "../shop/community-widget";
import { useNotifications } from "@/components/contexts/notification-context";
import { useCommunityEvents, type CommunityEventMap } from "@/hooks/useCommunityEvents";
import {
  useGetCommunityActivityQuery,
  useGetMyCommunitiesQuery,
  type CommunityMessage,
} from "@/lib/api/communityApiSlice";

type LiveMessage = CommunityEventMap["community_message"];

type MessageLike = {
  id: string;
  community?: string;
  community_id?: string;
  community_name?: string;
  sender_username: string;
  sender_avatar?: string | null;
  content?: string;
  attachment_name?: string;
  created_at: string;
};

interface ActivityItem {
  id: string;
  communityId: string;
  groupName: string;
  senderName: string;
  senderAvatar?: string;
  lastMessage: string;
  createdAtMs: number;
  timestamp: string;
}

function avatarFor(username: string, avatar?: string | null): string | undefined {
  if (avatar && /^https?:\/\//.test(avatar)) return avatar;
  return username
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=0D9488&color=fff`
    : undefined;
}

function timeAgo(value?: string): string {
  if (!value) return "";
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString([], { month: "short", day: "numeric" });
}

function preview(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

export default function CommunityLiveFeed() {
  const { data: activity = [], refetch } = useGetCommunityActivityQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });
  const { data: myCommunities = [] } = useGetMyCommunitiesQuery(undefined);
  const { notifications } = useNotifications();
  const [liveMessages, setLiveMessages] = useState<LiveMessage[]>([]);

  const onCommunityMessage = useCallback((msg: CommunityEventMap["community_message"]) => {
    setLiveMessages((prev) => {
      const rest = prev.filter((m) => m.id !== msg.id);
      return [msg, ...rest].slice(0, 8);
    });
  }, []);

  useCommunityEvents({ onCommunityMessage });

  // Live refetch when a community activity notification arrives (keeps the
  // REST snapshot fresh even if the socket missed an event).
  useNotificationsAwareRefetch(notifications, refetch);

  const communityNames: Record<string, string> = {};
  myCommunities.forEach((c) => {
    communityNames[c.id] = c.name;
  });

  const items = useMemo<ActivityItem[]>(() => {
    const toItem = (m: MessageLike): ActivityItem => {
      const communityId = m.community_id ?? m.community ?? "";
      return {
        id: m.id,
        communityId,
        groupName: m.community_name || communityNames[communityId] || communityId,
        senderName: m.sender_username || "Community member",
        senderAvatar: avatarFor(m.sender_username || "", m.sender_avatar),
        lastMessage: preview(m.content || "") || m.attachment_name || "Sent a file",
        createdAtMs: Date.parse(m.created_at) || 0,
        timestamp: timeAgo(m.created_at),
      };
    };

    const seeded: CommunityMessage[] = activity.filter((m) => m.content || m.attachment_name);
    const combined = [...liveMessages, ...seeded].map(toItem);

    const seen = new Set<string>();
    return combined
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      })
      .sort((a, b) => b.createdAtMs - a.createdAtMs)
      .slice(0, 3);
  }, [liveMessages, activity, communityNames]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">Community Live Activity</h2>
        </div>
        <Link href="/dashboard/community?tab=messages" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
          View All
          <ArrowRight size={14} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">No community activity yet</p>
          <p className="text-xs text-slate-300 mt-1">Join a community to see live conversations here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((msg, index) => (
            <Link
              key={msg.id}
              href={`/dashboard/community?group=${msg.communityId}`}
              className="block animate-fade-in-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CommunityWidget
                groupName={msg.groupName}
                senderName={msg.senderName}
                senderAvatar={msg.senderAvatar}
                lastMessage={msg.lastMessage}
                timestamp={msg.timestamp}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function useNotificationsAwareRefetch(notifications: unknown[], refetch: () => void) {
  const seenNotifIdsRef = useRef(new Set<string>());
  const lastRefetchAtRef = useRef(0);

  useEffect(() => {
    if (notifications.length === 0) return;
    const newest = notifications[0] as { id: string; notificationType?: string };
    if (!newest || seenNotifIdsRef.current.has(newest.id)) return;
    seenNotifIdsRef.current.add(newest.id);
    if (newest.notificationType !== "community_message" && newest.notificationType !== "community_post") return;
    const now = Date.now();
    if (now - lastRefetchAtRef.current < 3000) return;
    lastRefetchAtRef.current = now;
    refetch();
  }, [notifications, refetch]);
}