"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { Users, Bell, Shield, LogOut, Info, Link as LinkIcon } from "lucide-react";


interface GroupInfoProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
}

export function GroupInfoSidebar({ isOpen, onClose, group }: GroupInfoProps) {
  if (!isOpen || !group) return null;

  return (
    <aside className="w-[320px] border-l border-slate-100 bg-white flex flex-col h-full animate-in slide-in-from-right duration-300">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <SafeImage 
              src={group.avatar} 
              alt={group.title} 
              width={100} 
              height={100} 
              className="rounded-[2rem] object-cover shadow-2xl ring-4 ring-slate-50" 
            />
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-6 w-6 rounded-full border-4 border-white" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">{group.title}</h3>
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mt-1">Active Community</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-100 text-slate-400 hover:text-teal-600">
            <Bell size={20} />
          </Button>
          <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-100 text-slate-400 hover:text-teal-600">
            <Shield size={20} />
          </Button>
        </div>

        <hr className="border-slate-50" />

        {/* Description */}
        <div className="space-y-3">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">About</h4>
          <p className="text-xs font-bold text-slate-500 leading-relaxed">
            {group.description || "Building the future of decentralized finance. Join us for weekly sprints and ecosystem updates."}
          </p>
        </div>

        {/* Members Preview */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Members</h4>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-black text-[9px]">1.2k</Badge>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <SafeImage src={`https://i.pravatar.cc/150?u=${i}`} alt="" width={32} height={32} className="rounded-lg" />
                <span className="text-xs font-black text-slate-700 italic uppercase">User_{i}01</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Links */}
        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Quick Links</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
              <LinkIcon size={14} className="text-teal-600" />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">docs.sui.ecosystem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-8 bg-slate-50/50">
        <Button variant="ghost" className="w-full text-red-400 hover:text-red-500 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest gap-2">
          <LogOut size={14} /> Leave Group
        </Button>
      </div>
    </aside>
  );
}