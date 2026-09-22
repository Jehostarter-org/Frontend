"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Globe, ShieldCheck, UserCheck, UserPlus } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { CommunityAvatar } from "@/components/reuseables/CommunityAvatar";
import { useCreateCommunityMutation } from "@/lib/api/communityApiSlice";
import { CommunityTermsSummary } from "@/components/legal/community-terms-summary";

interface CreateCommunityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateCommunityDialog({
  isOpen,
  onOpenChange,
}: CreateCommunityDialogProps) {
  const router = useRouter();
  const [communityName, setCommunityName] = useState("");
  const [description, setDescription] = useState("");
  const [requireApproval, setRequireApproval] = useState(true);

  const [createCommunity, { isLoading: isSubmitting }] = useCreateCommunityMutation();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCommunityName("");
      setDescription("");
      setRequireApproval(true);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!communityName.trim()) {
      toast.error("Community name is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", communityName.trim());
      formData.append("description", description.trim());
      formData.append("visibility", "public");
      formData.append("require_approval", String(requireApproval));

      const created = await createCommunity(formData).unwrap();

      toast.success("Community Launched! 🚀", {
        description: `${communityName} is now live.`,
      });

      onOpenChange(false);

      // Navigate to the new community
      router.push(`/dashboard/community?group=${created.id}`);

      // Optional: refresh the page to show the new community in the list
      setTimeout(() => {
        router.refresh();
      }, 500);

    } catch (err: any) {
      console.error("Create community error:", err);

      // Handle different error formats
      let errorMessage = "Something went wrong. Please try again.";

      if (err?.data?.detail) {
        errorMessage = err.data.detail;
      } else if (err?.data?.name) {
        errorMessage = Array.isArray(err.data.name) ? err.data.name[0] : err.data.name;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error("Failed to create community", { description: errorMessage });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-lg shadow-2xl bg-slate-50">
        <div className="max-h-[85dvh] overflow-y-auto">
          <div className="bg-teal-900 p-6 md:p-8 text-white relative">
          <Sparkles className="absolute top-4 right-4 opacity-20 w-12 h-12 rotate-12" />
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl font-black tracking-tight">
              Start a Community
            </DialogTitle>
            <DialogDescription className="text-teal-100 font-medium">
              Create a space for others to discuss, trade, and connect.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Name *
                </Label>
                <Input
                  placeholder="The Tech Hub"
                  value={communityName}
                  onChange={(e) => setCommunityName(e.target.value)}
                  className="bg-slate-50 border-none rounded-xl focus:ring-teal-500/10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  About
                </Label>
                <Textarea
                  placeholder="Short description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 200))}
                  className="bg-slate-50 border-none rounded-xl focus:ring-teal-500/10 resize-none"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between gap-3 bg-teal-50 border border-teal-100 rounded-xl p-3">
                <div className="flex items-start gap-2.5">
                  {requireApproval ? (
                    <UserCheck size={16} className="text-teal-700 mt-0.5 shrink-0" />
                  ) : (
                    <UserPlus size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <p className="text-[12px] font-bold text-slate-700 leading-tight">
                      Require approval to join
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug">
                      {requireApproval
                        ? "New members are approved by you before joining."
                        : "Anyone can join the group instantly."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={requireApproval}
                  onClick={() => setRequireApproval((v) => !v)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
                    requireApproval ? "bg-teal-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      requireApproval ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <CommunityTermsSummary agreementText="By creating a community, you agree to these Community Terms & Services." accent="teal" />

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={!communityName.trim() || isSubmitting}
                className="w-full bg-teal-900 hover:bg-teal-800 text-white font-black rounded-xl h-12 shadow-lg shadow-teal-900/20 transition-all active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Launch"
                )}
              </Button>
            </DialogFooter>
          </form>

          {/* Live preview */}
          <div className="hidden md:flex p-8 bg-slate-50 flex-col justify-center items-center border-l border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              Live Preview
            </p>

            <div className="w-full max-w-[240px] bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500 transform hover:scale-105">
              <div className="h-16 w-16 rounded-xl overflow-hidden mb-4 ring-4 ring-teal-500/5">
                <CommunityAvatar
                  name={communityName || "Your Community Name"}
                  className="h-full w-full rounded-xl"
                  textClassName="text-[22px]"
                />
              </div>

              <h4 className="font-black text-slate-900 leading-tight mb-2 break-words">
                {communityName || "Your Community Name"}
              </h4>

              <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-3 italic">
                {description || "The description will appear here as you type..."}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-black uppercase text-slate-300 tracking-tighter">
                <span className="flex items-center gap-1">
                  <Globe size={10} /> Public
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={10} /> Verified
                </span>
              </div>
            </div>

            <p className="mt-6 text-[10px] text-slate-400 font-medium text-center leading-relaxed">
              This is how your community will appear in the{" "}
              <b>Discover</b> feed.
            </p>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}