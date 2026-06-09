"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CommunityPoll } from "./communityPoll";
import CommunityWidget from "../shop/community-widget";
import { useGetCommunityFeedQuery } from "@/lib/api/communityApiSlice";

interface LiveFeedProps {
  allMessages: any[];
}

export default function CommunityLiveFeed({ allMessages }: LiveFeedProps) {
  const { data: feed = [] } = useGetCommunityFeedQuery(undefined);
  const latestActivity = (feed.length > 0 ? feed : allMessages).slice(-3).reverse();

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

      <div className="space-y-4">
        {latestActivity.map((msg, index) => (
          <div key={msg.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
            <CommunityWidget 
              groupName={msg.groupName || msg.community_name || "General"}
              senderName={msg.senderName || msg.author_username || "Community member"}
              senderAvatar={msg.senderAvatar || "/images/photo3.png"}
              lastMessage={msg.content}
              timestamp={msg.timestamp || msg.created_at}
            />
          </div>
        ))}
      </div>

      <CommunityPoll 
        question="Which Sui feature are you most excited for in 2026?"
        options={[
          { label: "DeepBook V3", votes: 45 },
          { label: "Enoki Updates", votes: 30 },
          { label: "Native Bridge", votes: 25 }
        ]}
      />
    </div>
  );
}
