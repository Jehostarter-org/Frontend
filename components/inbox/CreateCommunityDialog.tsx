"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Sparkles, Globe, ShieldCheck } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { FaUserFriends } from "react-icons/fa";
import { useCreateCommunityMutation } from "@/lib/api/communityApiSlice";

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
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [createCommunity, { isLoading: isSubmitting }] = useCreateCommunityMutation();

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCommunityName("");
      setDescription("");
      setCoverImage(null);
      setCoverPreview(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  // Create preview URL when file is selected
  useEffect(() => {
    if (!coverImage) {
      setCoverPreview(null);
      return;
    }

    // Validate file type and size
    if (!coverImage.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      setCoverImage(null);
      return;
    }

    if (coverImage.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      setCoverImage(null);
      return;
    }

    const previewUrl = URL.createObjectURL(coverImage);
    setCoverPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [coverImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!communityName.trim()) {
      toast.error("Community name is required");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("name", communityName.trim());
      formData.append("description", description.trim());
      formData.append("visibility", "public");

      // Only append cover_image if a file was selected
      if (coverImage) {
        formData.append("cover_image", coverImage);
      }

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
      } else if (err?.data?.cover_image) {
        errorMessage = Array.isArray(err.data.cover_image) ? err.data.cover_image[0] : err.data.cover_image;
      } else if (err?.message) {
        errorMessage = err.message;
      }

      toast.error("Failed to create community", { description: errorMessage });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverImage(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none rounded-lg shadow-2xl bg-slate-50">
        <div className="bg-teal-900 p-8 text-white relative">
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
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white">
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

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Group Picture
                </Label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <ImagePlus size={18} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {coverImage ? coverImage.name : "Choose a community picture"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {coverImage && (
                  <p className="text-[10px] text-teal-600 mt-1">
                    ✓ Image ready to upload ({(coverImage.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="submit"
                disabled={!communityName.trim() || isSubmitting || isUploading}
                className="w-full bg-teal-900 hover:bg-teal-800 text-white font-black rounded-xl h-12 shadow-lg shadow-teal-900/20 transition-all active:scale-95"
              >
                {(isSubmitting || isUploading) ? (
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
          <div className="p-8 bg-slate-50 flex flex-col justify-center items-center border-l border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
              Live Preview
            </p>

            <div className="w-full max-w-[240px] bg-white rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white transition-all duration-500 transform hover:scale-105">
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Community cover preview"
                  className="h-16 w-16 rounded-xl object-cover mb-4 ring-4 ring-teal-500/5"
                />
              ) : (
                <div className="h-12 w-12 bg-teal-50 rounded-lg flex items-center justify-center text-teal-700 mb-4 ring-4 ring-teal-500/5">
                  <FaUserFriends size={40} />
                </div>
              )}

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
      </DialogContent>
    </Dialog>
  );
}