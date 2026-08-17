"use client";

import React, { useState, useRef } from "react";
import {
  X, Users, Lock, Globe, Loader2, Crown,
  LogOut, UserMinus, Link2, Mail, Copy, Check,
  Send, Share2, UserPlus, MessageCircle, Star, Pencil, Camera,
  CheckCircle2, XCircle, UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { CommunityAvatar } from "@/components/reuseables/CommunityAvatar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RenameCommunityDialog } from "@/components/dashboard/community/rename-community-dialog";
import type { CommunityItem } from "@/components/types/community";
import type { Participant } from "@/lib/api/messagesApiSlice";
import {
  useGetCommunityMembersQuery,
  useLeaveCommunityMutation,
  useRemoveCommunityMemberMutation,
  useGenerateInviteLinkMutation,
  useInviteByEmailMutation,
  useUpdateCommunityMutation,
  useGetPendingMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
} from "@/lib/api/communityApiSlice";

interface GroupInfoSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  group: CommunityItem | undefined;
  currentUserId: string | null;
  onlineUsers?: Set<string>;
  dmParticipant?: Participant | null; // Add this for DM view
  onUserClick?: (member: any) => void; // Opens profile quick view
}

type AdminModal = "share" | "addMember" | null;

export function GroupInfoSidebar({
  isOpen,
  onClose,
  group,
  currentUserId,
  onlineUsers = new Set(),
  dmParticipant,
  onUserClick,
}: GroupInfoSidebarProps) {
  // ── Modal state ────────────────────────────────────────────────────────────
  const [activeModal, setActiveModal] = useState<AdminModal>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<{ userId: string; username: string } | null>(null);
  const [renameOpen, setRenameOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const [leaveCommunity, { isLoading: isLeaving }] = useLeaveCommunityMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveCommunityMemberMutation();
  const [generateLink, { isLoading: isGeneratingLink }] = useGenerateInviteLinkMutation();
  const [sendEmailInvites, { isLoading: isSendingEmail }] = useInviteByEmailMutation();
  const [updateCommunity] = useUpdateCommunityMutation();
  const [approveMember, { isLoading: isApproving }] = useApproveMemberMutation();
  const [rejectMember, { isLoading: isRejecting }] = useRejectMemberMutation();

  const { data: members = [], isLoading: isLoadingMembers } = useGetCommunityMembersQuery(
    group?.id ?? "",
    { skip: !group?.id || !isOpen || !!dmParticipant },
  );

  const isAdmin = group?.isAdmin ?? false;

  const { data: pendingMembers = [], refetch: refetchPending } = useGetPendingMembersQuery(
    group?.id ?? "",
    { skip: !group?.id || !isOpen || !isAdmin || !!dmParticipant },
  );

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !group?.id) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Maximum 5 MB allowed." });
      return;
    }
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("cover_image", file);
      await updateCommunity({ id: group.id, body: formData }).unwrap();
      toast.success("Community picture updated");
    } catch {
      toast.error("Failed to update picture");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleApprove = async (memberId: string, username: string) => {
    if (!group?.id) return;
    try {
      await approveMember({ communityId: group.id, memberId }).unwrap();
      toast.success(`${username} approved!`);
      refetchPending();
    } catch {
      toast.error("Failed to approve member.");
    }
  };

  const handleReject = async (memberId: string, username: string) => {
    if (!group?.id) return;
    try {
      await rejectMember({ communityId: group.id, memberId }).unwrap();
      toast.success(`${username} rejected.`);
      refetchPending();
    } catch {
      toast.error("Failed to reject member.");
    }
  };

  const onlineCount = members.filter((m: any) => {
    const mid = String(m.user?.id ?? m.id ?? "");
    return onlineUsers.has(mid);
  }).length;

  if (!isOpen && dmParticipant) return null;

  // If showing DM info
  if (dmParticipant) {
    const isOnline = onlineUsers.has(String(dmParticipant.id));

    return (
      <>
        {/* Mobile backdrop */}
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 md:hidden"
          onClick={onClose}
        />

        <aside className="w-full md:w-[300px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden z-30 h-full absolute right-0 top-0 md:relative shadow-xl md:shadow-none">
          {/* Header */}
          <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
            <h3 className="text-sm font-semibold text-slate-700">User Info</h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-700">
              <X size={18} />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center pt-8 pb-5 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
              <div className="relative">
                <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-slate-100 shadow-md">
                  <SafeImage
                    src={dmParticipant.avatar_url}
                    alt={dmParticipant.full_name}
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                  />
                </div>
                {isOnline && (
                  <div className="absolute bottom-2 right-2 h-4 w-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                )}
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900 text-center">
                {dmParticipant.full_name}
              </h2>

              <div className="flex items-center gap-1.5 mt-1">
                {dmParticipant.is_gold && (
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-semibold text-amber-600">Gold Member</span>
                  </div>
                )}
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${isOnline ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-100 border-slate-200'}`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className={`text-[10px] font-medium ${isOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>

              <div className="mt-4 w-full bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-[12px] text-slate-600 truncate flex-1">
                    {dmParticipant.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 py-4 space-y-2">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(dmParticipant.email);
                  toast.success("Email copied to clipboard!");
                }}
                className="w-full gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl text-[13px] font-medium"
              >
                <Mail size={15} />
                Copy Email Address
              </Button>

              {/* You could add a report button here if needed */}
              {/* <Button
                variant="ghost"
                className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100 rounded-xl text-[13px] font-medium"
              >
                <Flag size={15} />
                Report User
              </Button> */}
            </div>

            {/* Stats */}
            <div className="px-4 py-4 border-t border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Conversation Info
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Started</span>
                  <span className="text-slate-700 font-medium">
                    Recently
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Status</span>
                  <span className="text-slate-700 font-medium flex items-center gap-1">
                    <MessageCircle size={12} className="text-blue-500" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Original group info sidebar (unchanged below)
  if (!isOpen || !group) return null;

  // ── Remove member ──────────────────────────────────────────────────────────
  const handleRemoveMember = async (userId: string, username: string) => {
    if (!group?.id) return;
    setConfirmRemove({ userId, username });
  };

  const executeRemove = async () => {
    if (!group?.id || !confirmRemove) return;
    setRemovingId(confirmRemove.userId);
    setConfirmRemove(null);
    try {
      await removeMember({ communityId: group.id, userId: confirmRemove.userId }).unwrap();
      toast.success(`${confirmRemove.username} has been removed.`);
    } catch (err: any) {
      toast.error("Could not remove member.", { description: err?.data?.detail });
    } finally {
      setRemovingId(null);
    }
  };

  // ── Generate invite link ───────────────────────────────────────────────────
  const handleGenerateLink = async () => {
    if (!group?.id) return;
    try {
      const result = await generateLink(group.id).unwrap();
      setInviteLink(result.invite_url);
      toast.success("Invite link generated!");
    } catch (err: any) {
      toast.error("Could not generate link.", { description: err?.data?.detail });
    }
  };

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // ── Invite by email ────────────────────────────────────────────────────────
  const handleSendEmailInvites = async () => {
    if (!group?.id || !emailInput.trim()) return;
    const emails = emailInput
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes("@"));

    if (emails.length === 0) {
      toast.error("Enter at least one valid email address.");
      return;
    }

    try {
      const result = await sendEmailInvites({ communityId: group.id, emails }).unwrap();
      toast.success(result.detail);
      setEmailInput("");
      setActiveModal(null);
    } catch (err: any) {
      toast.error("Failed to send invites.", { description: err?.data?.detail });
    }
  };

  // ── Leave ──────────────────────────────────────────────────────────────────
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

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-20 md:hidden"
        onClick={onClose}
      />

      <aside className="w-full md:w-[300px] flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden z-30 h-full absolute right-0 top-0 md:relative shadow-xl md:shadow-none">

        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-slate-200 shrink-0">
          <h3 className="text-sm font-semibold text-slate-700">Group Info</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full h-8 w-8 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* ── Avatar ── */}
          <div className="flex flex-col items-center pt-8 pb-5 px-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
            <div className="relative h-20 w-20">
              <CommunityAvatar
                name={group.title}
                src={group.avatar}
                className="h-full w-full rounded-2xl shadow-md ring-2 ring-slate-100"
                textClassName="text-[26px]"
              />
              {isAdmin && (
                <>
                  <input
                    ref={avatarFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="absolute -bottom-1 -right-1 h-7 w-7 bg-teal-600 hover:bg-teal-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white transition-colors"
                    title="Change community picture"
                  >
                    {isUploadingImage ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Camera size={12} />
                    )}
                  </button>
                </>
              )}
            </div>

            <h2 className="mt-3 text-[15px] font-bold text-slate-900 text-center leading-snug flex items-center justify-center gap-1.5">
              <span className="text-center">{group.title}</span>
              {isAdmin && (
                <button
                  onClick={() => setRenameOpen(true)}
                  className="text-slate-300 hover:text-teal-600 transition-colors"
                  title="Rename community"
                  type="button"
                >
                  <Pencil size={13} />
                </button>
              )}
            </h2>
            <div className="flex items-center gap-1.5 mt-1 text-[12px] text-slate-500 font-medium">
              {group.isPrivate
                ? <><Lock size={11} /> Private</>
                : <><Globe size={11} /> Public</>
              }
              <span className="text-slate-300">·</span>
              <Users size={11} />
              <span>{group.memberCount ?? members.length} members</span>
            </div>

            {isAdmin && (
              <div className="mt-2 flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                <Crown size={11} />
                <span className="text-[11px] font-semibold">You&apos;re the admin</span>
              </div>
            )}

            {/* ── Require Approval toggle (admin only) ── */}
            {isAdmin && !dmParticipant && (
              <div className="mt-3 flex items-center justify-between w-full px-1">
                <div className="flex items-center gap-2">
                  <UserCheck size={13} className="text-slate-400" />
                  <span className="text-[12px] font-medium text-slate-600">Require approval to join</span>
                </div>
                <button
                  onClick={() => {
                    if (!group?.id) return;
                    updateCommunity({
                      id: group.id,
                      body: { require_approval: !group.requireApproval } as any,
                    });
                  }}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    group.requireApproval ? "bg-teal-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                      group.requireApproval ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            )}

            {/* ── Share + Add Member buttons (admins only) ── */}
            {isAdmin && (
              <div className="mt-4 flex items-center gap-2 w-full">
                <button
                  onClick={() => setActiveModal(activeModal === "share" ? null : "share")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold border transition-all ${activeModal === "share"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                >
                  <Share2 size={13} /> Share
                </button>
                <button
                  onClick={() => setActiveModal(activeModal === "addMember" ? null : "addMember")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold border transition-all ${activeModal === "addMember"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-600"
                    }`}
                >
                  <UserPlus size={13} /> Add Member
                </button>
              </div>
            )}

            {/* ── Share panel ── */}
            {isAdmin && activeModal === "share" && (
              <div className="mt-3 w-full bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 size={11} /> Invite Link
                </p>
                {inviteLink ? (
                  <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-100">
                    <p className="flex-1 text-[11px] text-slate-600 truncate font-mono">{inviteLink}</p>
                    <button
                      onClick={handleCopyLink}
                      className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-100 transition-colors"
                      title="Copy link"
                    >
                      {linkCopied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                    </button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleGenerateLink}
                    disabled={isGeneratingLink}
                    className="w-full text-[12px] gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGeneratingLink ? <Loader2 size={13} className="animate-spin" /> : <Link2 size={13} />}
                    Generate Link
                  </Button>
                )}
                <p className="text-[10px] text-blue-400">Link expires in 7 days.</p>
              </div>
            )}

            {/* ── Add Member panel ── */}
            {isAdmin && activeModal === "addMember" && (
              <div className="mt-3 w-full bg-teal-50 border border-teal-100 rounded-xl p-3 space-y-2">
                <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail size={11} /> Invite by Email
                </p>
                <div className="flex gap-2">
                  <input
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSendEmailInvites(); } }}
                    placeholder="email1@x.com, email2@x.com"
                    className="flex-1 bg-white border border-teal-200 rounded-lg px-3 py-2 text-[12px] text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-teal-300 focus:border-teal-300"
                  />
                  <Button
                    size="icon"
                    onClick={handleSendEmailInvites}
                    disabled={isSendingEmail || !emailInput.trim()}
                    className="h-9 w-9 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shrink-0"
                    title="Send invites"
                  >
                    {isSendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  </Button>
                </div>
                <p className="text-[10px] text-teal-500">Separate multiple emails with commas or spaces.</p>
              </div>
            )}
          </div>

          {/* ── Pending Join Requests (Admin only) ── */}
          {isAdmin && !dmParticipant && pendingMembers.length > 0 && (
            <div className="px-4 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck size={14} className="text-amber-500" />
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Pending Requests · {pendingMembers.length}
                </p>
              </div>
              <div className="space-y-2">
                {pendingMembers.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-3 p-2 rounded-xl bg-amber-50/60 border border-amber-100/60"
                  >
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden shrink-0">
                      {req.profile_picture ? (
                        <img src={req.profile_picture} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700">
                          {req.username?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-800 truncate">{req.username}</p>
                      <p className="text-[10px] text-slate-400">Requested to join</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleApprove(req.id, req.username)}
                        disabled={isApproving || isRejecting}
                        className="h-7 w-7 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                        title="Approve"
                      >
                        {isApproving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(req.id, req.username)}
                        disabled={isApproving || isRejecting}
                        className="h-7 w-7 flex items-center justify-center rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Reject"
                      >
                        {isRejecting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <XCircle size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Description ── */}
          {group.description && (
            <div className="px-4 py-4 border-b border-slate-100">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Description</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">{group.description}</p>
            </div>
          )}

          {/* ── Members ── */}
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-slate-400" />
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Members · {group.memberCount ?? members.length}
                </p>
              </div>
              {onlineCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  {onlineCount} online
                </span>
              )}
            </div>

            {isLoadingMembers ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 size={18} className="animate-spin text-blue-500" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-[12px] text-slate-400 text-center py-3">No members found.</p>
            ) : (
              <ul className="space-y-2.5">
                {members.slice(0, 30).map((member: any) => {
                  const memberId = String(member.user ?? member.id ?? "");
                  const username = member.user?.username ?? member.username ?? "Unknown";
                  const isCreator = group.creator != null && String(group.creator) === memberId;
                  const isSelf = String(currentUserId) === memberId;
                  const canRemove = isAdmin && !isSelf && !isCreator;
                  const isOnline = onlineUsers.has(memberId);

                  return (
                    <li key={memberId} className="flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 relative">
                        <SafeImage
                          src={member.profile_picture ?? member.user?.profile_picture ?? null}
                          alt={username}
                          width={36}
                          height={36}
                          className="rounded-full object-cover ring-1 ring-slate-100"
                        />
                        {isOnline && (
                          <span
                            className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full"
                            title="Online"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          onClick={() => { if (!isSelf) onUserClick?.(member); }}
                          className={`text-[13px] font-medium text-slate-800 truncate leading-tight ${isSelf ? "" : "cursor-pointer hover:underline"}`}
                        >
                          {username}
                        </p>
                        {(isCreator || member.role === "admin" || member.role === "moderator") && (
                          <p className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                            <Crown size={9} /> {isCreator ? "Admin" : member.role}
                          </p>
                        )}
                        {isOnline && !isCreator && member.role === "member" && (
                          <p className="text-[10px] text-emerald-500 font-semibold">Online</p>
                        )}
                      </div>

                      {canRemove && (
                        <button
                          onClick={() => handleRemoveMember(memberId, username)}
                          disabled={removingId === memberId || isRemoving}
                          className="h-7 w-7 flex items-center justify-center rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                          title={`Remove ${username}`}
                        >
                          {removingId === memberId
                            ? <Loader2 size={13} className="animate-spin" />
                            : <UserMinus size={13} />
                          }
                        </button>
                      )}
                    </li>
                  );
                })}
                {members.length > 30 && (
                  <li className="text-[12px] text-slate-400 text-center pt-1">
                    +{members.length - 30} more members
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* ── Leave group ── */}
          {!isAdmin && (
            <div className="px-4 py-4">
              <Button
                variant="ghost"
                onClick={handleLeave}
                disabled={isLeaving}
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 border border-red-100 rounded-lg text-[13px] font-medium gap-2"
              >
                {isLeaving ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                Leave Group
              </Button>
            </div>
          )}
        </div>
      </aside>

      <ConfirmDialog
        open={!!confirmRemove}
        title={`Remove ${confirmRemove?.username ?? "member"}?`}
        message={`Are you sure you want to remove ${confirmRemove?.username ?? "this member"} from this group? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="danger"
        loading={removingId !== null}
        onConfirm={executeRemove}
        onCancel={() => setConfirmRemove(null)}
      />

      <RenameCommunityDialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        community={group}
      />
    </>
  );
}
