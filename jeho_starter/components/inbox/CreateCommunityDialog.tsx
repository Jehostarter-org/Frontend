"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Users, Globe, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaLayerGroup, FaUserFriends } from "react-icons/fa";


interface CreateCommunityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCommunityDialog({ isOpen, onOpenChange }: CreateCommunityDialogProps) {
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCommunityName("");
      setDescription("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Community Launched! 🚀", {
        description: `${communityName} is now live.`,
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Error", { description: "Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-lg shadow-2xl bg-slate-50">
        <div className="bg-teal-600 p-8 text-white relative">
          <Sparkles className="absolute top-4 right-4 opacity-20 w-12 h-12 rotate-12" />
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black tracking-tight">Start a Community</DialogTitle>
            <DialogDescription className="text-teal-50 font-medium">
              Create a space for others to discuss, trade, and connect.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Name</Label>
                <Input placeholder="The Tech Hub" value={communityName} onChange={(e) => setCommunityName(e.target.value)} className="bg-slate-50 border-none rounded-xl focus:ring-teal-500/10" required />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">About</Label>
                <Textarea placeholder="Short description..." value={description} onChange={(e) => setDescription(e.target.value.slice(0, 100))} className="bg-slate-50 border-none rounded-xl focus:ring-teal-500/10 resize-none" rows={3} />
              </div>
            </div>

            <DialogFooter className="pt-4">
               <Button type="submit" disabled={!communityName.trim() || isSubmitting} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black rounded-xl h-12 shadow-lg shadow-teal-600/20 transition-all active:scale-95" >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "Launch"}
              </Button>
            </DialogFooter>
          </form>

          <div className="p-8 bg-slate-50 flex flex-col justify-center items-center border-l border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Live Preview</p>
            
            <div className="w-full max-w-[240px] bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500 transform hover:scale-105">
              <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600 mb-4 ring-4 ring-teal-500/5">
                <FaUserFriends size={40} strokeWidth={2.5} />
              </div>
              
              <h4 className="font-black text-slate-900 leading-tight mb-2 break-words">
                {communityName || "Your Community Name"}
              </h4>
              
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3 italic">
                {description || "The description will appear here as you type..."}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                <span className="flex items-center gap-1"><Globe size={10}/> Public</span>
                <span className="flex items-center gap-1"><ShieldCheck size={10}/> Verified</span>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              This is how your community will appear in the <b>Discover</b> feed.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}