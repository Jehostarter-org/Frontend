"use client";

import React, { useRef, useState } from "react";
import { X, Users, Lock, Globe, Camera, Loader2, Crown, LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import type { CommunityItem } from "@/components/types/community";
import {
  useGetCommunityMembersQuery,
  useUpdateCommunityMutation,
  useLeaveCommunityMutation,
} from "@/lib/api/communityApiSlice";

interface GroupInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityItem | undefined;
  /** Pass the current user's ID so the sidebar can detect if they're the creator/admin */
  currentUserId?: string | null;
}

export function GroupInfoSidebar({
  isOpen,
  onClose,
  group,
  currentUserId,
}: GroupInfoSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const [updateCommunity, { isLoading: isUpdating }] = useUpdateCommunityMutation();
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();

  const { data: members = [], isLoading: isLoadingMembers } = useGetCommunityMembersQuery(
    group?.id ?? "",
    { skip: !group?.id || !isOpen },
  );

  // Determine if current user is the admin/creator of this group
  const isAdmin =
    currentUserId != null &&
    group?.creator != null &&
    String(group.creator) === String(currentUserId);

  const handleAvatarClick = () => {
    if (!isAdmin) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !group?.id) return;

    // Validate type & size (max 5 MB)
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }

    // Optimistic local preview
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append("cover_image", file);

    try {
      await updateCommunity({ id: group.id, body: formData }).unwrap();
      toast.success("Group photo updated!");
    } catch (err: any) {
      setPreviewUrl(null); // Roll back preview on error
      const detail = err?.data?.detail || "Could not update group photo. Please try again.";
      toast.error("Upload failed", { description: detail });
    }
  };

  const handleLeave = async () => {
    if (!group?.id) return;
    try {
      await leaveCommunity(group.id).unwrap();
      toast.success("You left the group.");
      onClose();
    } catch {
      toast.error("Could not leave group. Please try again.");
    }
  };

  if (!isOpen || !group) return null;

  const displayAvatar = previewUrl ?? group.avatar;

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="w-full md:w-[300px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden z-30 h-full absolute right-0 top-0 md:relative shadow-xl md:shadow-none transition-all duration-300">

        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-200 shrink-0 bg-white">
          <h3 className="text-sm font-semibold text-slate-700">Group Info</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-700"
          >
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* Avatar section */}
          <div className="flex flex-col items-center pt-8 pb-5 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <div
              className={`relative group ${isAdmin ? "cursor-pointer" : "cursor-default"}`}
              onMouseEnter={() => isAdmin && setIsHoveringAvatar(true)}
              onMouseLeave={() => setIsHoveringAvatar(false)}
              onClick={handleAvatarClick}
              title={isAdmin ? "Change group photo" : undefined}
            >
              {/* Avatar ring */}
              <div className={`p-[3px] rounded-full transition-all duration-200 ${isAdmin && isHoveringAvatar ? "bg-blue-500" : "bg-slate-200"}`}>
                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 relative">
                  <SafeImage
                    src={displayAvatar}
                    alt={group.title}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover rounded-full"
                  />

                  {/* Hover overlay — only for admin */}
                  {isAdmin && (
                    <div
                      className={`absolute inset-0 bg-black/45 flex flex-col items-center justify-center gap-1 rounded-full transition-opacity duration-200 ${isHoveringAvatar ? "opacity-100" : "opacity-0"}`}
                    >
                      {isUpdating ? (
                        <Loader2 size={22} className="text-white animate-spin" />
                      ) : (
                        <>
                          <Camera size={20} className="text-white" />
                          <span className="text-[10px] text-white font-semibold leading-none">Change</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Camera badge */}
              {isAdmin && !isUpdating && (
                <div className="absolute bottom-0.5 right-0.5 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Camera size={13} className="text-white" />
                </div>
              )}

              {/* Loading spinner badge while uploading */}
              {isUpdating && (
                <div className="absolute bottom-0.5 right-0.5 h-7 w-7 bg-blue-600 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Loader2 size={13} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUpdating}
            />

            <h4 className="mt-4 text-lg font-semibold text-slate-800 text-center leading-tight">
              {group.title}
            </h4>

            <div className="flex items-center gap-1.5 mt-1">
              {group.isPrivate ? (
                <Lock size={12} className="text-slate-400" />
              ) : (
                <Globe size={12} className="text-slate-400" />
              )}
              <span className="text-[12px] text-slate-400 font-medium">
                {group.isPrivate ? "Private group" : "Public group"}
              </span>
            </div>

            {isAdmin && (
              <div className="mt-2 flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <Crown size={11} />
                <span className="text-[11px] font-semibold">You&apos;re the admin</span>
              </div>
            )}

            {isAdmin && (
              <p className="text-[11px] text-slate-400 mt-2 text-center">
                Tap the photo to change the group picture
              </p>
            )}
          </div>

          {/* Description */}
          {group.description && (
            <div className="px-4 py-4 border-b border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Description
              </p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                {group.description}
              </p>
            </div>
          )}

          {/* Members */}
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Users size={14} className="text-slate-400" />
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Members · {group.memberCount ?? members.length}
              </p>
            </div>

            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={18} className="animate-spin text-blue-500" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-[12px] text-slate-400 text-center py-3">No members found.</p>
            ) : (
              <ul className="space-y-2.5">
                {members.slice(0, 20).map((member: any) => {
                  const memberId = String(member.user?.id ?? member.id ?? "");
                  const isCreator =
                    group.creator != null && String(group.creator) === memberId;
                  return (
                    <li key={memberId} className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0">
                        <SafeImage
                          src={member.user?.profile_picture ?? member.avatar ?? null}
                          alt={member.user?.username ?? member.username ?? "Member"}
                          width={36}
                          height={36}
                          className="rounded-full object-cover ring-1 ring-slate-100"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-800 truncate leading-tight">
                          {member.user?.username ?? member.username ?? "Unknown"}
                        </p>
                        {isCreator && (
                          <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                            <Crown size={9} /> Admin
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
                {members.length > 20 && (
                  <li className="text-[12px] text-slate-400 text-center pt-1">
                    +{members.length - 20} more members
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Leave group */}
          {!isAdmin && (
            <div className="px-4 py-4">
              <Button
                variant="ghost"
                onClick={handleLeave}
                disabled={isLeaving}
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100 rounded-lg text-[13px] font-medium gap-2"
              >
                {isLeaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <LogOut size={15} />
                )}
                Leave Group
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}