"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Mail, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  MessageCircle, 
  AlertTriangle, 
  ChevronLeft, 
  Flag 
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { Badge } from "@/components/ui/badge";

interface ProfileQuickViewProps {
  user: {
    id: string;
    name: string;
    avatar: string;
    role?: string;
    location?: string;
    joinedDate?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onMessage: (userId: string) => void;
}

export function ProfileQuickView({ user, isOpen, onClose, onMessage }: ProfileQuickViewProps) {
  const [showReportOptions, setShowReportOptions] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  if (!user) return null;

  const handleReport = async (reason: string) => {
    setIsReporting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    toast("Report Submitted", {
      description: `Thank you. Our moderators will review ${user.name}'s activity.`,
      className: "bg-white border-red-100 border-2 rounded-2xl shadow-xl",
    });
    
    setIsReporting(false);
    setShowReportOptions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        setShowReportOptions(false); 
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden border-none rounded-lg shadow-2xl bg-white transition-all duration-300">
        {!showReportOptions ? (
          <>
            <div className="h-24 bg-gradient-to-r from-teal-500 to-emerald-400 w-full" />
            <div className="px-8 pb-8 -mt-12 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="h-24 w-24 rounded-[2rem] p-1.5 bg-white shadow-xl mb-4 group-hover:rotate-3 transition-transform duration-300">
                  <SafeImage src={user.avatar} alt={user.name} width={96} height={96} fallback="user" className="rounded-[1.6rem] object-cover h-full w-full" />
                </div>
                <div className="absolute bottom-6 right-0 h-6 w-6 bg-emerald-500 border-4 border-white rounded-full shadow-sm" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {user.name}
                <ShieldCheck className="text-teal-500 h-5 w-5" />
              </h3>
              
              <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-500 border-none font-bold uppercase tracking-widest text-[9px] px-3">
                {user.role || "Community Member"}
              </Badge>

              <div className="grid grid-cols-2 gap-4 w-full mt-8 py-4 border-y border-slate-50">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined</span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-1">
                    <Calendar size={12} className="text-teal-500" />
                    {user.joinedDate || "March 2026"}
                  </span>
                </div>
                <div className="flex flex-col items-center border-l border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</span>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-teal-500" />
                    {user.location || "Lagos, NG"}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 w-full mt-6">
                <Button onClick={() => {if (user?.id) { onMessage(user.id); onClose(); }}} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl h-12 shadow-lg shadow-teal-600/20 active:scale-95 transition-all">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Button>
                <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-100 text-slate-400 hover:text-teal-600">
                  <Mail size={18} />
                </Button>
              </div>

              <Button onClick={() => setShowReportOptions(true)} className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2" >
                <AlertTriangle size={12} />
                Report User
              </Button>
            </div>
          </>
        ) : (
          <div className="p-8 animate-fade-in-up">
            <Button onClick={() => setShowReportOptions(false)} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors" >
              <ChevronLeft size={14} /> Back to Profile
            </Button>

            <h3 className="text-xl font-black text-slate-900 mb-2">Report {user.name}</h3>
            <p className="text-xs font-medium text-slate-500 mb-6">
              Select a reason for reporting. Our safety team will investigate immediately.
            </p>

            <div className="space-y-2">
              {["Spamming", "Harassment", "Inappropriate Content", "Scam/Fraud"].map((reason) => (
                <Button key={reason} variant="ghost" disabled={isReporting} onClick={() => handleReport(reason)} className="w-full justify-between bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl font-bold py-6 px-4 group transition-all" >
                  {reason}
                  <Flag size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}