"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Inbox, Users, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useNotifications } from "@/components/contexts/notification-context";
import {
  useGetMyCommunitiesQuery,
  useGetCommunityFeedQuery,
} from "@/lib/api/communityApiSlice";

interface Stat {
  key: string;
  label: string;
  href: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}

export default function ActivityAnalytics() {
  const { totalUnreadCount, getInboxCount, notifications } = useNotifications();
  const { data: myCommunities = [] } = useGetMyCommunitiesQuery(undefined);
  const { data: feed = [] } = useGetCommunityFeedQuery(undefined);

  const [messageCount, setMessageCount] = useState(0);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!seededRef.current) {
      setMessageCount(getInboxCount());
      seededRef.current = true;
    }
  }, [getInboxCount]);

  useEffect(() => {
    if (seededRef.current) setMessageCount(getInboxCount());
  }, [getInboxCount, notifications]);

  const stats: Stat[] = [
    {
      key: "unread",
      label: "Unread Notifications",
      href: "/dashboard/notification",
      value: totalUnreadCount,
      icon: <Bell className="w-5 h-5" />,
      accent: "bg-teal-50 text-teal-600",
    },
    {
      key: "messages",
      label: "New Messages",
      href: "/dashboard/inbox",
      value: messageCount,
      icon: <Inbox className="w-5 h-5" />,
      accent: "bg-blue-50 text-blue-600",
    },
    {
      key: "communities",
      label: "Communities",
      href: "/dashboard/community",
      value: myCommunities.length,
      icon: <Users className="w-5 h-5" />,
      accent: "bg-indigo-50 text-indigo-600",
    },
    {
      key: "activity",
      label: "Community Posts",
      href: "/dashboard/community",
      value: feed.length,
      icon: <MessageSquare className="w-5 h-5" />,
      accent: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Link key={stat.key} href={stat.href} className="block group">
          <Card className="border-gray-200 shadow-sm group-hover:border-teal-400 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.accent}`}>
                {stat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                <p className="mt-1 text-[11px] leading-tight font-semibold text-slate-400 uppercase tracking-wider break-words">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}