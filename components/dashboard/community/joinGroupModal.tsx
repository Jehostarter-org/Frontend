"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommunityAvatar } from "@/components/reuseables/CommunityAvatar";
import { Users, ShieldCheck, Zap, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { CommunityTermsSummary } from "@/components/legal/community-terms-summary";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: {
    id: string;
    title: string;
    avatar: string;
    description?: string;
    memberCount?: number;
    isPrivate?: boolean;
    requireApproval?: boolean;
  } | null;
  onJoin: (groupId: string) => void;
}

export function JoinGroupModal({ isOpen, onClose, group, onJoin }: JoinGroupModalProps) {
  const [isJoining, setIsJoining] = useState(false);

  if (!group) return null;

  const handleJoin = async () => {
    setIsJoining(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onJoin(group.id);
    setIsJoining(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-white rounded-[2.5rem] shadow-2xl">
        <div className="max-h-[85dvh] overflow-y-auto">
        {/* Header Visual */}
        <div className="h-32 bg-gradient-to-br from-blue-500 to-sky-500 relative">
          <div className="absolute -bottom-10 left-8 p-1 bg-white rounded-[1.8rem] shadow-xl">
            <CommunityAvatar
              name={group.title}
              className="h-20 w-20 rounded-[1.5rem]"
              textClassName="text-[26px]"
            />
          </div>
          <div className="absolute top-4 right-6 flex gap-2">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[10px] font-black uppercase tracking-widest">
              {group.isPrivate ? <Lock size={10} className="mr-1" /> : <Globe size={10} className="mr-1" />}
              {group.isPrivate ? "Private" : "Public"}
            </Badge>
          </div>
        </div>

        <div className="px-8 pt-14 pb-8 space-y-6">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
              Join {group.title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium text-sm leading-relaxed pt-2">
              {group.description || "Connect with other builders, share insights, and participate in exclusive community events."}
            </DialogDescription>
          </DialogHeader>

          {/* Group Stats & Rules */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Users size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Members</span>
              </div>
              <p className="text-lg font-black text-slate-900">{group.memberCount || "1.2k"}+</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Zap size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Activity</span>
              </div>
              <p className="text-lg font-black text-slate-900 italic">HIGH</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-1">Community Guidelines</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50/50 p-2 rounded-xl">
                <ShieldCheck size={14} className="text-blue-500" />
                Respect all community members
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50/50 p-2 rounded-xl">
                <ShieldCheck size={14} className="text-blue-500" />
                No spam or self-promotion
              </li>
            </ul>
          </div>

          <CommunityTermsSummary agreementText="By joining this community, you agree to these Community Terms & Services." accent="blue" />
        </div>
        </div>

        <DialogFooter className="p-6 md:p-8 bg-slate-50/50 border-t border-slate-100 sm:justify-between items-center">
          <Button variant="ghost" onClick={onClose} className="text-slate-400 font-black uppercase text-[10px] tracking-widest hover:bg-transparent hover:text-slate-600">
            Cancel
          </Button>
          <Button 
            onClick={handleJoin} 
            disabled={isJoining}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-[0.2em] px-8 py-6 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            {isJoining ? "Joining..." : group.requireApproval ? "Request to Join" : "Join Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
