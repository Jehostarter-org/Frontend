"use client";

import { FaUser } from "react-icons/fa";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SafeImage } from "@/components/reuseables/SafeImage";


interface CommunityWidgetProps {
  groupName?: string;
  senderName?: string;
  senderAvatar?: string;
  lastMessage?: string;
  timestamp?: string;
  onClick?: () => void;
}

export default function CommunityWidget({
  groupName = "Sui Developers",
  senderName = "Sarah Chen",
  senderAvatar = "https://i.pravatar.cc/150?u=sarah",
  lastMessage = "Has anyone tried the new Move compiler update yet?",
  timestamp = "2m ago",
  onClick
}: CommunityWidgetProps) {
  return (
    <Card onClick={onClick} className="overflow-hidden border-none shadow-xl bg-white rounded-xl cursor-pointer group active:scale-[0.98] transition-all" >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 rounded-lg text-teal-600">
              <FaUser className="h-10 w-10" />
            </div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight italic uppercase">
              {groupName}
            </h3>
          </div>
          <Badge variant="secondary" className="bg-slate-100 text-slate-400 border-none font-bold text-[9px] px-2">
            {timestamp}
          </Badge>
        </div>

        <div className="bg-slate-50/50 rounded-lg p-4 border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-xl overflow-hidden shadow-sm">
              <SafeImage src={senderAvatar} alt={senderName} width={32} height={32} className="object-cover" />
            </div>
            <span className="font-black text-xs text-slate-800 tracking-tight">
              {senderName}
            </span>
          </div>
          
          <div className="relative">
            <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-2 italic">
              "{lastMessage}"
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageSquare size={12} />
          Join Discussion
        </div>
      </CardContent>
    </Card>
  );
}