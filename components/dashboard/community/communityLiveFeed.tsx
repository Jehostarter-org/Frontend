"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare } from "lucide-react";
import CommunityWidget from "../shop/community-widget";
import { useGetCommunityFeedQuery, type Post } from "@/lib/api/communityApiSlice";

function toWidgetItem(post: Post) {
  return {
    id: post.id,
    groupName: post.community,
    senderName: post.author_username,
    senderAvatar: post.author_username ? `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_username)}&background=0D9488&color=fff` : undefined,
    lastMessage: post.content,
    timestamp: post.created_at,
  };
}

export default function CommunityLiveFeed() {
  const { data: feed = [] } = useGetCommunityFeedQuery(undefined);
  const latestActivity = feed.slice(-3).reverse().map(toWidgetItem);

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
        <Link href="/dashboard/community" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
          View All 
          <ArrowRight size={14} />
        </Link>
      </div>

      {latestActivity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-400">No community activity yet</p>
          <p className="text-xs text-slate-300 mt-1">Join a community to see live posts here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {latestActivity.map((msg, index) => (
            <div key={msg.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
              <CommunityWidget 
                groupName={msg.groupName}
                senderName={msg.senderName}
                senderAvatar={msg.senderAvatar}
                lastMessage={msg.lastMessage}
                timestamp={msg.timestamp}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
