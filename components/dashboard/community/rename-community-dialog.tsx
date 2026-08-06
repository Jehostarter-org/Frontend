"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useUpdateCommunityMutation } from "@/lib/api/communityApiSlice";
import type { CommunityItem } from "@/components/types/community";

interface RenameCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  community: CommunityItem | undefined;
  onRenamed?: (id: string, name: string) => void;
}

export function RenameCommunityDialog({
  open,
  onClose,
  community,
  onRenamed,
}: RenameCommunityDialogProps) {
  const [name, setName] = useState("");
  const [updateCommunity, { isLoading: isUpdating }] = useUpdateCommunityMutation();

  useEffect(() => {
    if (open) setName(community?.title ?? "");
  }, [open, community]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!community?.id || !trimmed) return;
    if (trimmed === community.title) {
      onClose();
      return;
    }
    try {
      await updateCommunity({ id: community.id, body: { name: trimmed } }).unwrap();
      toast.success("Community name updated");
      onRenamed?.(community.id, trimmed);
      onClose();
    } catch (err: any) {
      toast.error("Could not rename community", {
        description: err?.data?.detail || "Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md bg-white border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-teal-600" /> Rename Community
          </DialogTitle>
          <DialogDescription>Give this community a new name.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Community name"
            maxLength={80}
            autoFocus
            className="h-11 border-gray-200 focus-visible:ring-teal-500/20 focus-visible:border-teal-500"
          />

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className="h-10 rounded-xl font-bold text-sm border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !name.trim()}
              className="h-10 rounded-xl font-bold text-sm bg-teal-800 hover:bg-teal-900 text-white"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
