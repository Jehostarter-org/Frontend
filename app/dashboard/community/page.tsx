"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import MessageContent from "@/components/reuseables/MessageContent";
import type { CommunityItem } from "@/components/types/community";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import {
  Search,
  ArrowLeft,
  Send,
  Info,
  Loader2,
  MessageSquare,
  Paperclip,
  Check,
  CheckCheck,
  File,
  FileText,
  Lock,
  Sparkles,
  Trash2,
  Reply,
  X,
  Plus,
  Play,
  Music,
  Pencil,
} from "lucide-react";

import { SidebarItem } from "@/components/dashboard/community/communitySidebar";
import { JoinGroupModal } from "@/components/dashboard/community/joinGroupModal";
import { GroupInfoSidebar } from "@/components/dashboard/community/groupInfoSidebar";
import { RenameCommunityDialog } from "@/components/dashboard/community/rename-community-dialog";
import EmojiPicker from "@/components/dashboard/community/EmojiPicker";
import CreateCommunityDialog from "@/components/inbox/CreateCommunityDialog";
import { DMList } from "@/components/messaging/DMList";
import { DMChatView } from "@/components/messaging/DMChatView";
import { MediaViewer, isMediaType } from "@/components/reuseables/media-viewer";

import { useAuth } from "@/components/contexts/auth-context";
import { useCommunityEvents } from "@/hooks/useCommunityEvents";
import {
  useGetCommunitiesQuery,
  useGetMyCommunitiesQuery,
  useGetCommunityQuery,
  useJoinCommunityMutation,
  useGetCommunityMessagesQuery,
  useSendCommunityMessageMutation,
  useToggleReactionMutation,
  type CommunityMessage,
} from "@/lib/api/communityApiSlice";
import {
  useGetConversationQuery,
  type Conversation,
} from "@/lib/api/messagesApiSlice";

// ── File upload limits ──────────────────────────────────────────────────────

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ALLOWED_FILE_TYPES = [
  // Images
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  // Videos
  "video/mp4", "video/webm", "video/ogg", "video/quicktime",
  // Audio
  "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac",
  // Documents
  "application/pdf",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "text/plain",
  "text/csv",
];
const ACCEPTED_FILE_EXTENSIONS = "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

function validateFileSize(file: File): boolean {
  if (file.size > MAX_FILE_SIZE) {
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    toast.error("File too large", { description: `${fileMB} MB exceeds the ${maxMB} MB limit.` });
    return false;
  }
  return true;
}

function validateFileType(file: File): boolean {
  // Some browsers/OS don't detect MIME type — fall back to extension check
  if (!file.type && file.name.includes(".")) {
    return true;
  }
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    toast.error("Unsupported file type", { description: `"${file.name.split(".").pop()?.toUpperCase()}" files are not allowed.` });
    return false;
  }
  return true;
}

// ── Helper: resolve the current user's ID from localStorage ──────────────────

function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      return String(user.id ?? "");
    }
  } catch { }
  return null;
}

// ── Helper: make a relative media URL absolute ────────────────────────────────
function resolveMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ??
    "http://127.0.0.1:8000";
  return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

// ── WebSocket hook ────────────────────────────────────────────────────────────

function useCommunityChat(
  communityId: string | null,
  callbacks?: {
    onCommunityUpdated?: (community: any) => void;
    onCommunityDeleted?: (communityId: string) => void;
    onMemberJoined?: (data: any) => void;
    onMemberLeft?: (data: any) => void;
    onMemberRemoved?: (data: any) => void;
  },
) {
  const [liveMessages, setLiveMessages] = useState<CommunityMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const wsRef = useRef<WebSocket | null>(null);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const retryRef = useRef(0);
  const closedRef = useRef(false);

  const { data: history = [], isLoading: isLoadingHistory } = useGetCommunityMessagesQuery(
    communityId!,
    { skip: !communityId, pollingInterval: 15000 },
  );

  const seededRef = useRef(false);
  useEffect(() => {
    if (history.length > 0) {
      seededRef.current = true;
      setLiveMessages((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const merged = [...prev];
        history.forEach((m) => { if (!seen.has(m.id)) merged.push(m); });
        return merged.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
      });
    }
  }, [history]);

  useEffect(() => {
    seededRef.current = false;
    retryRef.current = 0;
    setLiveMessages([]);
    setOnlineUsers(new Set());
  }, [communityId]);

  const connect = useCallback(() => {
    if (!communityId || closedRef.current) return;

    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) {
      toast.error("Not authenticated — cannot connect to chat.");
      return;
    }

    const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
    const ws = new WebSocket(`${wsBase}/ws/community/${communityId}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      retryRef.current = 0;
      setOnlineUsers(new Set());
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          const incoming: CommunityMessage = {
            id: data.id,
            community: communityId,
            sender: data.sender_id,
            sender_username: data.sender_username,
            sender_avatar: data.sender_avatar ?? null,
            content: data.content,
            reply_to: data.reply_to ?? null,
            attachment: null,
            attachment_url: data.attachment_url ?? null,
            attachment_name: data.attachment_name ?? "",
            attachment_type: data.attachment_type ?? "",
            attachment_size: data.attachment_size ?? 0,
            created_at: data.created_at,
            reactions: data.reactions ?? {},
          };
          setLiveMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );
          setTypingUsers((prev) => prev.filter((u) => u !== data.sender_username));
        }

        if (data.type === "message_deleted") {
          setLiveMessages((prev) => prev.filter((m) => m.id !== data.message_id));
        }

        if (data.type === "typing") {
          const username: string = data.username;
          setTypingUsers((prev) =>
            prev.includes(username) ? prev : [...prev, username],
          );
          clearTimeout(typingTimers.current[username]);
          typingTimers.current[username] = setTimeout(
            () => setTypingUsers((prev) => prev.filter((u) => u !== username)),
            3000,
          );
        }

        if (data.type === "user_joined") {
          setOnlineUsers((prev) => new Set([...prev, data.user_id]));
        }

        if (data.type === "user_left") {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(data.user_id);
            return next;
          });
        }

        if (data.type === "reaction_toggled") {
          setLiveMessages((prev) =>
            prev.map((m) =>
              m.id === data.message_id ? { ...m, reactions: data.reactions } : m,
            ),
          );
        }

        if (data.type === "member_joined") {
          callbacksRef.current?.onMemberJoined?.(data);
        }

        if (data.type === "member_left") {
          callbacksRef.current?.onMemberLeft?.(data);
        }

        if (data.type === "member_removed") {
          callbacksRef.current?.onMemberRemoved?.(data);
        }

        if (data.type === "community_updated") {
          callbacksRef.current?.onCommunityUpdated?.(data.community);
        }

        if (data.type === "community_deleted") {
          callbacksRef.current?.onCommunityDeleted?.(data.community_id);
        }

      } catch { }
    };

    ws.onerror = () => setIsConnected(false);

    ws.onclose = () => {
      setIsConnected(false);
      setOnlineUsers(new Set());
      if (closedRef.current) return;
      retryRef.current++;
      const delay = Math.min(1000 * Math.pow(2, retryRef.current - 1), 30000);
      setTimeout(() => { if (!closedRef.current) connect(); }, delay);
    };
  }, [communityId]);

  useEffect(() => {
    closedRef.current = false;
    wsRef.current?.close();
    retryRef.current = 0;
    connect();

    return () => {
      closedRef.current = true;
      wsRef.current?.close();
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [connect]);

  const sendMessage = useCallback((content: string, replyToId?: string | null) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("Not connected — try again in a moment.");
      return;
    }
    ws.send(JSON.stringify({ type: "message", content, reply_to_id: replyToId ?? null }));
  }, []);

  const sendTyping = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing" }));
    }
  }, []);

  const sendDeleteMessage = useCallback((messageId: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("Not connected — try again in a moment.");
      return;
    }
    ws.send(JSON.stringify({ type: "delete_message", message_id: messageId }));
  }, []);

  const appendMessage = useCallback((message: CommunityMessage) => {
    setLiveMessages((prev) =>
      prev.some((item) => item.id === message.id) ? prev : [...prev, message],
    );
  }, []);

  const removeMessage = useCallback((messageId: string) => {
    setLiveMessages((prev) => prev.filter((m) => m.id !== messageId));
  }, []);

  const updateMessageReactions = useCallback((messageId: string, reactions: Record<string, string[]>) => {
    setLiveMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reactions } : m)),
    );
  }, []);

  return {
    messages: liveMessages,
    isConnected,
    isLoadingHistory,
    typingUsers,
    onlineUsers,
    sendMessage,
    sendTyping,
    sendDeleteMessage,
    appendMessage,
    removeMessage,
    updateMessageReactions,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TabType = "groups" | "messages" | "discovery";

function apiToCommunityItem(c: any, currentUserId?: string | null): CommunityItem {
  const isCreator =
    Boolean(currentUserId) && String(c.creator) === String(currentUserId);
  const isMember = Boolean(c.is_member) || isCreator;

  return {
    id: c.id,
    title: c.name,
    avatar: resolveMediaUrl(c.cover_image),
    message: c.description ?? "",
    unreadCount: c.unread_count || 0,
    type: isMember ? "active_group" : "discovery",
    description: c.description,
    memberCount: c.member_count,
    isPrivate: c.visibility === "private",
    creator: c.creator,
    isAdmin: Boolean(c.is_admin) || isCreator,
  };
}

// ── Doodle wallpaper ──────────────────────────────────────────────────────────

function DoodleWallpaper() {
  const bg = "#f8fafc";
  const stroke = "rgba(15, 23, 42, 0.045)";
  return (
    <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundColor: bg }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <pattern id="doodles" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M12 5 c -1.5 -1.5, -4 -1.5, -5.5 0 c -1.5 1.5, -1.5 4, 0 5.5 l 5.5 5.5 l 5.5 -5.5 c 1.5 -1.5, 1.5 -4, 0 -5.5 c -1.5 -1.5, -4 -1.5, -5.5 0" fill="none" stroke={stroke} strokeWidth="1" transform="translate(10, 15) scale(0.6)" />
            <path d="M4 4 h12 a2 2 0 0 1 2 2 v6 a2 2 0 0 1 -2 2 h-8 l-4 4 v-4 a2 2 0 0 1 -2 -2 v-6 a2 2 0 0 1 2 -2 z" fill="none" stroke={stroke} strokeWidth="1.2" transform="translate(60, 10) scale(0.8)" />
            <circle cx="10" cy="10" r="8" fill="none" stroke={stroke} strokeWidth="1.2" transform="translate(15, 60)" />
            <path d="M5 12 q 4 4, 8 0" fill="none" stroke={stroke} strokeWidth="1.2" transform="translate(15, 60)" />
            <path d="M10 2 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="none" stroke={stroke} strokeWidth="1" transform="translate(42, 72) scale(0.6)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#doodles)" />
      </svg>
    </div>
  );
}

// ── Message context menu ──────────────────────────────────────────────────────

interface ContextMenu {
  messageId: string;
  x: number;
  y: number;
}

// ── Attachment Preview (WhatsApp-style inline previews) ──────────────────────

interface AttachmentPreviewProps {
  url: string;
  type: string;
  name: string;
  size: number;
  onClick: (url: string, type: string, name: string, size: number) => void;
}

function AttachmentPreview({ url, type, name, size, onClick }: AttachmentPreviewProps) {
  const handleClick = () => onClick(url, type, name, size);
  const sizeLabel = size > 0 ? `${(size / 1024).toFixed(0)} KB` : '';

  // Image — thumbnail preview
  if (isMediaType(type, 'image')) {
    return (
      <button
        onClick={handleClick}
        className="mt-1.5 mb-1 overflow-hidden rounded-lg cursor-pointer block max-w-[280px] group/preview relative"
      >
        <img
          src={url}
          alt={name}
          className="w-full h-auto max-h-[200px] object-cover rounded-lg transition-transform duration-200 group-hover/preview:scale-[1.02]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/10 transition-colors duration-200 rounded-lg" />
      </button>
    );
  }

  // Video — thumbnail with play button overlay
  if (isMediaType(type, 'video')) {
    return (
      <button
        onClick={handleClick}
        className="mt-1.5 mb-1 relative overflow-hidden rounded-lg cursor-pointer block max-w-[280px] group/preview"
      >
        <video
          src={url}
          className="w-full h-auto max-h-[200px] object-cover rounded-lg"
          preload="metadata"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg group-hover/preview:bg-black/40 transition-colors duration-200">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover/preview:scale-110 transition-transform duration-200">
            <Play size={20} className="text-slate-800 ml-0.5" fill="currentColor" />
          </div>
        </div>
      </button>
    );
  }

  // Audio — inline player card
  if (isMediaType(type, 'audio')) {
    return (
      <div className="mt-1.5 mb-1 flex items-center gap-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2.5 max-w-[280px]">
        <button
          onClick={handleClick}
          className="w-10 h-10 shrink-0 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
        >
          <Play size={16} className="text-blue-600 ml-0.5" fill="currentColor" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-slate-700 truncate">{name}</p>
          <p className="text-[10px] text-slate-400">{sizeLabel || 'Audio'}</p>
        </div>
        <Music size={14} className="text-slate-300 shrink-0" />
      </div>
    );
  }

  // PDF — document card
  if (isMediaType(type, 'pdf')) {
    return (
      <button
        onClick={handleClick}
        className="mt-1.5 mb-1 flex items-center gap-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2.5 max-w-[280px] cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors group/preview text-left"
      >
        <div className="w-10 h-10 shrink-0 bg-red-100 rounded-lg flex items-center justify-center">
          <FileText size={18} className="text-red-500" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-slate-700 truncate group-hover/preview:text-blue-700 transition-colors">{name}</p>
          <p className="text-[10px] text-slate-400">PDF • {sizeLabel || 'Document'}</p>
        </div>
      </button>
    );
  }

  // Other files — generic file card
  return (
    <button
      onClick={handleClick}
      className="mt-1.5 mb-1 flex items-center gap-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2.5 max-w-[280px] cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors group/preview text-left"
    >
      <div className="w-10 h-10 shrink-0 bg-slate-100 rounded-lg flex items-center justify-center">
        <File size={18} className="text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold text-slate-700 truncate group-hover/preview:text-blue-700 transition-colors">{name}</p>
        <p className="text-[10px] text-slate-400">{sizeLabel || 'File'}</p>
      </div>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(
    () => (searchParams.get("tab") === "messages" ? "messages" : "groups"),
  );
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    () => searchParams.get("group"),
  );
  const [selectedDM, setSelectedDM] = useState<Conversation | null>(null);
  const [showDMInfo, setShowDMInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isInfoBarOpen, setIsInfoBarOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedDiscoGroup, setSelectedDiscoGroup] = useState<CommunityItem | null>(null);
  const [messageReadStates, setMessageReadStates] = useState<Record<string, "sent" | "delivered" | "read">>({});
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ id: string; sender_username: string; content: string } | null>(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string; name: string; size: number } | null>(null);
  const [emojiPickerMsgId, setEmojiPickerMsgId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    currentUserIdRef.current = getCurrentUserId();
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "messages") {
      setActiveTab("messages");
    }

    const groupId = searchParams.get("group");
    if (groupId) {
      setSelectedGroupId(groupId);
      setActiveTab("groups");
    }
  }, [searchParams]);

  const { token, user } = useAuth();
  const currentUserId = user?.id ?? getCurrentUserId();

  const { data: myCommunitiesRaw = [], isLoading: loadingMy, refetch: refetchMy } = useGetMyCommunitiesQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const { data: allCommunitiesRaw = [], isLoading: loadingAll, refetch: refetchAll } = useGetCommunitiesQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });

  const [myCommunities, setMyCommunities] = useState<any[]>([]);
  const [allCommunities, setAllCommunities] = useState<any[]>([]);

  useEffect(() => { setMyCommunities(myCommunitiesRaw); }, [myCommunitiesRaw]);
  useEffect(() => { setAllCommunities(allCommunitiesRaw); }, [allCommunitiesRaw]);

  const isLoading = loadingMy || loadingAll;
  const [joinCommunity] = useJoinCommunityMutation();
  const [sendCommunityMessage, { isLoading: isUploadingFile }] = useSendCommunityMessageMutation();
  const [toggleReaction] = useToggleReactionMutation();

  const isDM = selectedGroupId?.startsWith("dm-") ?? false;
  const wsGroupId = selectedGroupId && !isDM ? selectedGroupId : null;
  const [renameOpen, setRenameOpen] = useState(false);
  const conversationIdParam = searchParams.get("conversation");
  const conversationId = conversationIdParam ? Number(conversationIdParam) : null;
  const { data: linkedConversation } = useGetConversationQuery(conversationId!, {
    skip: !token || !conversationId || Number.isNaN(conversationId),
  });

  useEffect(() => {
    if (!linkedConversation) return;
    setSelectedDM(linkedConversation);
    setSelectedGroupId(null);
    setActiveTab("messages");
  }, [linkedConversation]);

  // ── FIX: fetch the individual community when it's not in the list yet ────
  const communityInList = useMemo(
    () =>
      myCommunities.some((c) => c.id === selectedGroupId) ||
      allCommunities.some((c) => c.id === selectedGroupId),
    [myCommunities, allCommunities, selectedGroupId],
  );
  const { data: fetchedCommunity } = useGetCommunityQuery(
    selectedGroupId!,
    { skip: !selectedGroupId || isDM || communityInList },
  );

  const {
    messages,
    isConnected,
    isLoadingHistory,
    typingUsers,
    onlineUsers,
    sendMessage: sendCommunityMessageWS,
    sendTyping: sendCommunityTyping,
    sendDeleteMessage: sendCommunityDeleteMessage,
    appendMessage: appendCommunityMessage,
    removeMessage: removeCommunityMessage,
    updateMessageReactions: updateCommunityMessageReactions,
  } = useCommunityChat(wsGroupId, {
    onCommunityUpdated(community) {
      setAllCommunities((prev) => prev.map((c) => (c.id === community.id ? community : c)));
      setMyCommunities((prev) => prev.map((c) => (c.id === community.id ? community : c)));
    },
    onCommunityDeleted(communityId) {
      setAllCommunities((prev) => prev.filter((c) => c.id !== communityId));
      setMyCommunities((prev) => prev.filter((c) => c.id !== communityId));
      if (selectedGroupId === communityId) {
        setSelectedGroupId(null);
        setIsInfoBarOpen(false);
      }
    },
    onMemberJoined(data) {
      toast(`${data.username} joined the community`, { duration: 3000 });
    },
    onMemberLeft(data) {
      if (data.user_id === String(currentUserId)) {
        setSelectedGroupId(null);
        setIsInfoBarOpen(false);
      }
      toast(`${data.username} left the community`, { duration: 3000 });
    },
    onMemberRemoved(data) {
      if (data.user_id === String(currentUserId)) {
        setSelectedGroupId(null);
        setIsInfoBarOpen(false);
        setTimeout(() => window.location.reload(), 500);
        return;
      }
      toast("A member was removed", { duration: 3000 });
    },
  });

  useCommunityEvents({
    onCommunityCreated(data) {
      setAllCommunities((prev) => {
        if (prev.some((c) => c.id === data.community.id)) return prev;
        return [data.community, ...prev];
      });
    },
    onCommunityDeleted(data) {
      setAllCommunities((prev) => prev.filter((c) => c.id !== data.community_id));
      setMyCommunities((prev) => prev.filter((c) => c.id !== data.community_id));
    },
    onCommunityUpdated(data) {
      setAllCommunities((prev) => prev.map((c) => (c.id === data.community.id ? data.community : c)));
      setMyCommunities((prev) => prev.map((c) => (c.id === data.community.id ? data.community : c)));
    },
    onNewConversation(data) {
      toast("New message received", { duration: 3000 });
    },
  });

  const myGroupItems = useMemo(
    () => myCommunities.map((c) => apiToCommunityItem(c, currentUserId)),
    [myCommunities, currentUserId],
  );

  const myIds = useMemo(() => new Set(myCommunities.map((c) => c.id)), [myCommunities]);

  const discoverItems = useMemo(() => {
    return allCommunities
      .filter((c) => !myIds.has(c.id) && String(c.creator) !== String(currentUserId ?? ""))
      .map((c) => apiToCommunityItem(c, currentUserId));
  }, [allCommunities, myIds, currentUserId]);

  const communities = useMemo<CommunityItem[]>(() => {
    const base = activeTab === "groups" ? myGroupItems : discoverItems;
    const list = [...base];
    if (
      fetchedCommunity &&
      !list.some((c) => c.id === fetchedCommunity.id) &&
      (activeTab === "groups" || !myIds.has(fetchedCommunity.id))
    ) {
      list.unshift(apiToCommunityItem(fetchedCommunity, currentUserId));
    }
    return list;
  }, [activeTab, myGroupItems, discoverItems, fetchedCommunity, currentUserId, myIds]);

  // ── selectedGroup resolves from the merged list (includes fallback fetch) ─
  const selectedGroup = useMemo(
    () => communities.find((c) => c.id === selectedGroupId),
    [communities, selectedGroupId],
  );
  const isCurrentUserAdmin = selectedGroup?.isAdmin ?? false;

  const handleCommunityRenamed = (id: string, name: string) => {
    setAllCommunities((prev) => prev.map((c) => (String(c.id) === id ? { ...c, name } : c)));
    setMyCommunities((prev) => prev.map((c) => (String(c.id) === id ? { ...c, name } : c)));
  };

  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return communities.filter((item) => item.title.toLowerCase().includes(q));
  }, [communities, searchQuery]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
        50,
      );
    }
  }, [messages]);

  const readTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>[]>>({});
  const processedReadIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    messages.forEach((msg) => {
      if (processedReadIdsRef.current.has(msg.id)) return;
      processedReadIdsRef.current.add(msg.id);
      setMessageReadStates((prev) => ({ ...prev, [msg.id]: "sent" }));
      timers.push(setTimeout(() => setMessageReadStates((prev) => ({ ...prev, [msg.id]: "delivered" })), 1200));
      timers.push(setTimeout(() => setMessageReadStates((prev) => ({ ...prev, [msg.id]: "read" })), 2800));
    });
    return () => timers.forEach(clearTimeout);
  }, [messages]);

  useEffect(() => {
    const handler = () => setContextMenu(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // ── chatHeader uses selectedGroup directly (works even before list refetch) ─
  const chatHeader = useMemo(() => {
    if (!selectedGroupId) return null;
    if (isDM) return { title: "Direct Message", avatar: "", status: "Online", isDM: true };
    return {
      title: selectedGroup?.title || "Community",
      avatar: selectedGroup?.avatar || "",
      status: isConnected
        ? `${selectedGroup?.memberCount || 0} members • Active`
        : "Connecting…",
      isDM: false,
    };
  }, [selectedGroupId, selectedGroup, isConnected, isDM]);

  const handleItemClick = (item: CommunityItem) => {
    if (activeTab === "discovery") {
      setSelectedDiscoGroup(item);
      setIsJoinModalOpen(true);
    } else {
      setSelectedGroupId(item.id);
      setSelectedDM(null);
    }
  };

  const handleDMSelect = (conversation: Conversation) => {
    setSelectedDM(conversation);
    setSelectedGroupId(null);
    setActiveTab("messages");
  };

  const handleDMBack = () => {
    setSelectedDM(null);
  };

  const handleJoinConfirm = async (groupId: string) => {
    try {
      await joinCommunity(groupId).unwrap();
      setActiveTab("groups");
      setSelectedGroupId(groupId);
      toast.success("Joined community successfully!");
    } catch {
      toast.error("Failed to join. Please try again.");
    }
    setIsJoinModalOpen(false);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    const replyToId = replyingTo?.id ?? null;
    const replyToSnapshot = replyingTo;
    setNewMessage("");
    setReplyingTo(null);
    if (isConnected) {
      sendCommunityMessageWS(trimmed, replyToId);
    } else if (wsGroupId) {
      const tempId = `temp_${Date.now()}`;
      const optimistic: CommunityMessage = {
        id: tempId,
        community: wsGroupId,
        sender: String(currentUserId),
        sender_username: user?.username ?? "",
        sender_avatar: user?.avatar ?? null,
        content: trimmed,
        reply_to: replyToSnapshot,
        attachment: null,
        attachment_url: null,
        attachment_name: "",
        attachment_type: "",
        attachment_size: 0,
        reactions: {},
        created_at: new Date().toISOString(),
      };
      appendCommunityMessage(optimistic);
      try {
        const formData = new FormData();
        formData.append("content", trimmed);
        const uploaded = await sendCommunityMessage({ id: wsGroupId, body: formData }).unwrap();
        removeCommunityMessage(tempId);
        appendCommunityMessage(uploaded);
      } catch {
        removeCommunityMessage(tempId);
        toast.error("Message failed to send. Please try again.");
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !wsGroupId) return;
    if (!validateFileSize(file)) return;
    if (!validateFileType(file)) return;
    const formData = new FormData();
    formData.append("content", file.name);
    formData.append("attachment", file);
    try {
      const uploaded = await sendCommunityMessage({ id: wsGroupId, body: formData }).unwrap();
      appendCommunityMessage(uploaded);
      toast.success("File shared");
    } catch (err: any) {
      const detail = err?.data?.detail || "Unable to share this file. Please try again.";
      toast.error("File upload failed", { description: detail });
    }
  };

  const handleMessageContextMenu = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setContextMenu({ messageId, x: e.clientX, y: e.clientY });
  };

  const handleReplyToMessage = (msg: CommunityMessage) => {
    setContextMenu(null);
    setReplyingTo({
      id: msg.id,
      sender_username: msg.sender_username,
      content: (msg.content || "").slice(0, 80),
    });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDeleteMessage = (messageId: string) => {
    setContextMenu(null);
    if (!wsGroupId) return;
    removeCommunityMessage(messageId);
    sendCommunityDeleteMessage(messageId);
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (!wsGroupId) return;
    setEmojiPickerMsgId(null);
    try {
      const result = await toggleReaction({ communityId: wsGroupId, messageId, emoji }).unwrap();
      updateCommunityMessageReactions(messageId, result.reactions);
    } catch {
      toast.error("Could not update reaction.");
    }
  };

  const handleMediaClick = (url: string, type: string, name: string, size: number) => {
    setSelectedMedia({ url, type, name, size });
    setMediaViewerOpen(true);
  };

  if (isLoading)
    return (
      <DashboardShell>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </DashboardShell>
    );

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-slate-50 rounded-xl shadow-xl border border-slate-200 mx-2 mb-2 relative">

        {/* ── SIDEBAR ── */}
        <aside className={`${selectedGroupId || selectedDM ? "hidden md:flex" : "flex"} w-full md:w-[380px] flex-col border-r border-slate-200 bg-white z-20`}>
          <div className="bg-white h-[60px] flex items-center justify-between px-4 py-2 shrink-0 border-b border-slate-200">
            <h2 className="text-sm font-semibold text-slate-700">Communities</h2>
            <Button
              onClick={() => setShowCreateCommunity(true)}
              size="sm"
              className="h-8 gap-1.5 bg-teal-900 hover:bg-teal-800 text-white text-[11px] font-bold rounded-lg px-3 shadow-sm shadow-teal-900/20"
            >
              <Plus size={13} />
              Create Community
            </Button>
          </div>

          <div className="p-2.5 bg-white shrink-0 border-b border-slate-100 flex items-center">
            <div className="relative flex-1 bg-slate-100 rounded-lg flex items-center px-3 py-1.5 group border border-transparent focus-within:border-blue-300 transition-colors">
              <Search className="h-4 w-4 text-slate-500 mr-2 shrink-0" />
              <input
                placeholder="Search or start new chat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[14px] text-slate-800 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="flex bg-white px-4 py-2 shrink-0 border-b border-slate-100 overflow-x-auto gap-2 scrollbar-none">
            {(["groups", "messages", "discovery"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedGroupId(null); setSelectedDM(null); }}
                className={`py-1.5 px-4 rounded-full text-[13px] font-semibold transition-all shrink-0 capitalize ${activeTab === tab ? "bg-blue-50 text-blue-700" : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                  }`}
              >
                {tab === "groups" && "Groups"}
                {tab === "messages" && "Chats"}
                {tab === "discovery" && "Discover"}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
            <div className="py-2">
              {activeTab === "messages" ? (
                <DMList selectedId={selectedDM?.id ?? null} onSelect={handleDMSelect} />
              ) : (
                <>
                  {filteredList.length === 0 ? (
                    <div className="text-center py-12 px-6 flex flex-col items-center justify-center">
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <MessageSquare size={24} />
                      </div>
                      <p className="text-sm font-semibold text-slate-500">
                        {activeTab === "groups" ? "No active groups joined yet." : "No communities found."}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {activeTab === "discovery" ? "Check your internet or search filters." : "Explore the 'Discover' tab to find groups!"}
                      </p>
                    </div>
                  ) : (
                    filteredList.map((item) => (
                      <SidebarItem
                        key={item.id}
                        item={item}
                        isActive={selectedGroupId === item.id}
                        onClick={() => handleItemClick(item)}
                        isDM={false}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          </div>
        </aside>

        {/* ── MAIN CHAT AREA ── */}
        <main className="flex-1 flex flex-row bg-slate-50 relative overflow-hidden">
          <div className="flex-1 flex flex-col relative h-full">
            {selectedDM ? (
              <DMChatView
                conversation={selectedDM}
                onBack={handleDMBack}
                onInfoClick={() => setShowDMInfo(!showDMInfo)}
              />
            ) : selectedGroupId && chatHeader ? (
              <>
                {/* Chat Header */}
                <header className="h-[60px] bg-white flex items-center justify-between px-4 py-2 shrink-0 border-b border-slate-200 z-10 select-none">
                  <div className="flex items-center gap-3 min-w-0">
                    <Button variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8 text-slate-500" onClick={() => setSelectedGroupId(null)}>
                      <ArrowLeft size={20} />
                    </Button>
                    <div className="h-10 w-10 shrink-0">
                      <SafeImage src={chatHeader.avatar} alt={chatHeader.title} width={40} height={40} className="rounded-full object-cover ring-1 ring-black/5" />
                    </div>
                    <div className="min-w-0" onClick={() => setIsInfoBarOpen(true)}>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-[15px] text-slate-800 leading-tight truncate hover:underline cursor-pointer">{chatHeader.title}</h3>
                        {isCurrentUserAdmin && !chatHeader.isDM && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameOpen(true);
                            }}
                            className="h-6 w-6 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 shrink-0"
                            title="Rename community"
                          >
                            <Pencil size={12} />
                          </Button>
                        )}
                      </div>
                      <p className="text-[12px] text-slate-500 truncate font-normal leading-normal">{chatHeader.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 rounded-full h-10 w-10 shrink-0" onClick={() => setIsInfoBarOpen(!isInfoBarOpen)}>
                      <Info size={19} />
                    </Button>
                  </div>
                </header>

                {/* Messages Panel */}
                <div className="flex-1 relative overflow-hidden flex flex-col justify-end">
                  <DoodleWallpaper />
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 relative z-10 custom-scrollbar select-text">
                    {isLoadingHistory ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="bg-white/90 px-6 py-3 rounded-xl shadow-md flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                          <span className="text-xs font-semibold text-slate-500">Loading history...</span>
                        </div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full bg-white/70 backdrop-blur-sm rounded-2xl m-8 p-12 text-center border border-slate-100 select-none">
                        <MessageSquare size={48} className="text-blue-500 mb-4 animate-bounce" />
                        <h4 className="text-lg font-semibold text-slate-800">No Messages Yet</h4>
                        <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">Be the first to say hello in this community!</p>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex justify-center my-3 select-none">
                          <span className="bg-white text-[11px] font-medium text-slate-500 px-3 py-1 rounded-md shadow-sm border border-slate-100 uppercase tracking-wider">TODAY</span>
                        </div>

                        {messages.map((msg, index) => {
                          const currentUserId = currentUserIdRef.current;
                          const isMe = currentUserId !== null && currentUserId !== "" && String(msg.sender) === String(currentUserId);
                          const prevMsg = index > 0 ? messages[index - 1] : null;
                          const isConsecutive = prevMsg !== null && String(prevMsg.sender) === String(msg.sender);
                          const readState = messageReadStates[msg.id] || "sent";
                          const canDelete = isMe || isCurrentUserAdmin;

                          return (
                            <div
                              key={msg.id}
                              className={`flex w-full mb-0.5 ${isMe ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-0.5" : "mt-2.5"} group/msg`}
                              onContextMenu={(e) => handleMessageContextMenu(e, msg.id)}
                            >
                              {!isMe && !isConsecutive && (
                                <div className="h-8 w-8 shrink-0 mr-2 self-end">
                                  <SafeImage src={msg.sender_avatar} alt={msg.sender_username} width={32} height={32} className="rounded-full object-cover" />
                                </div>
                              )}
                              {!isMe && isConsecutive && <div className="w-10 shrink-0" />}

                              <div className={`relative flex flex-col max-w-[70%] sm:max-w-[60%] md:max-w-[50%] p-2 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${isMe
                                ? `bg-blue-50 text-slate-900 rounded-tr-none ${isConsecutive ? "rounded-tr-lg" : ""}`
                                : `bg-white text-slate-900 rounded-tl-none ${isConsecutive ? "rounded-tl-lg" : ""}`
                                }`}>

                                {!isConsecutive && (
                                  <div className={`absolute top-0 w-2.5 h-3 overflow-hidden ${isMe ? "right-[-10px]" : "left-[-10px]"}`}>
                                    <div className={`w-3 h-3 rotate-45 transform origin-top-left ${isMe ? "bg-blue-50" : "bg-white"}`} />
                                  </div>
                                )}

                                {!isMe && !isConsecutive && (
                                  <p className="text-[12px] font-bold text-blue-700 mb-0.5 hover:underline cursor-pointer select-none">
                                    {msg.sender_username}
                                  </p>
                                )}

                                {msg.reply_to && (
                                  <div className={`mb-1.5 px-2 py-1.5 rounded-md border-l-[3px] border-blue-400 text-[12px] leading-snug cursor-pointer select-none ${isMe ? "bg-blue-100/60" : "bg-slate-100"}`}>
                                    <p className="font-bold text-blue-600 truncate">{msg.reply_to.sender_username}</p>
                                    <p className="text-slate-500 truncate">{msg.reply_to.content}</p>
                                  </div>
                                )}

                                <div className="text-[14px] leading-relaxed pr-12 whitespace-pre-wrap break-words">
                                  <MessageContent text={msg.content} />
                                </div>

                                {msg.attachment_url && (
                                  <AttachmentPreview
                                    url={msg.attachment_url!}
                                    type={msg.attachment_type || ''}
                                    name={msg.attachment_name || 'File'}
                                    size={msg.attachment_size || 0}
                                    onClick={handleMediaClick}
                                  />
                                )}

                                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                  <div className="flex flex-wrap items-center gap-1 mt-1.5 mb-1">
                                    {Object.entries(msg.reactions).map(([emoji, users]) => {
                                      const hasReacted = currentUserId !== null && users.includes(String(currentUserId));
                                      return (
                                        <button
                                          key={emoji}
                                          onClick={() => handleToggleReaction(msg.id, emoji)}
                                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] leading-none border transition-colors ${
                                            hasReacted
                                              ? "bg-blue-100 border-blue-200 text-blue-700"
                                              : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                                          }`}
                                        >
                                          <span className="text-[13px]">{emoji}</span>
                                          <span className="font-medium">{users.length}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}

                                <div className="relative flex items-center gap-1 select-none mt-0.5">
                                  <div className="relative">
                                    {emojiPickerMsgId === msg.id && (
                                      <EmojiPicker
                                        onSelect={(emoji) => handleToggleReaction(msg.id, emoji)}
                                        onClose={() => setEmojiPickerMsgId(null)}
                                      />
                                    )}
                                    <button
                                      onClick={(e) => { e.stopPropagation(); setEmojiPickerMsgId(emojiPickerMsgId === msg.id ? null : msg.id); }}
                                      className="h-5 w-5 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors text-[11px] leading-none"
                                      title="Add reaction"
                                    >
                                      <Plus size={10} />
                                    </button>
                                  </div>
                                  <span className="text-[9px] text-slate-500 font-normal leading-none ml-auto">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </span>
                                  {isMe && (
                                    <span>
                                      {readState === "sent" && <Check size={13} className="text-slate-400 stroke-[2.5]" />}
                                      {readState === "delivered" && <CheckCheck size={13} className="text-[#8696a0] stroke-[2.5]" />}
                                      {readState === "read" && <CheckCheck size={13} className="text-[#53bdeb] stroke-[2.5]" />}
                                    </span>
                                  )}
                                </div>

                                <div className={`absolute -top-2 ${isMe ? "-left-16" : "-right-16"} opacity-0 group-hover/msg:opacity-100 transition-opacity duration-150 flex items-center gap-1`}>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleReplyToMessage(msg); }}
                                    className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200"
                                    title="Reply"
                                  >
                                    <Reply size={12} />
                                  </button>
                                  {canDelete && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                                      className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                                      title="Delete message"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-2.5 bg-white/95 py-2 px-4 rounded-xl shadow-md w-fit select-none animate-in slide-in-from-bottom-2 duration-300 ml-2">
                        <div className="flex gap-1">
                          {[0, 150, 300].map((delay) => (
                            <span key={delay} className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce shrink-0" style={{ animationDelay: `${delay}ms` }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">{typingUsers.join(", ")} is typing...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Input Area */}
                <footer className="bg-white py-2.5 px-4 flex flex-col shrink-0 relative z-20 select-none border-t border-slate-200">
                  {replyingTo && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                      <Reply size={14} className="text-blue-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-blue-600 leading-none mb-0.5">{replyingTo.sender_username}</p>
                        <p className="text-[12px] text-slate-500 truncate">{replyingTo.content}</p>
                      </div>
                      <button
                        onClick={() => setReplyingTo(null)}
                        className="shrink-0 h-5 w-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <input ref={fileInputRef} type="file" className="hidden" accept={ACCEPTED_FILE_EXTENSIONS} onChange={handleFileUpload} disabled={!isConnected || isUploadingFile} />
                    <Button type="button" variant="ghost" size="icon" disabled={!isConnected || isUploadingFile} onClick={() => fileInputRef.current?.click()} className="hover:bg-slate-100 rounded-full h-10 w-10 text-slate-500 shrink-0" title="Share file">
                      {isUploadingFile ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                    </Button>
                    <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-3">
                      <div className="flex-1 relative">
                        <input
                          ref={inputRef}
                          value={newMessage}
                          onChange={(e) => { setNewMessage(e.target.value); if (isConnected) sendCommunityTyping(); }}
                          placeholder={replyingTo ? `Reply to ${replyingTo.sender_username}…` : "Type a message"}
                          className="flex-1 bg-slate-100 rounded-lg px-4 py-2.5 text-[14px] text-slate-800 placeholder-slate-400 outline-none border-none shadow-sm focus:ring-1 focus:ring-blue-300 w-full"
                        />
                        {!isConnected && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                            <span className="text-[10px] text-amber-600 font-medium">Reconnecting...</span>
                          </div>
                        )}
                      </div>
                      <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md shrink-0 transition-all active:scale-95 disabled:bg-slate-300">
                        <Send size={18} className="translate-x-[1px]" />
                      </Button>
                    </form>
                  </div>
                </footer>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50 select-none h-full relative">
                <DoodleWallpaper />
                <div className="relative z-10 flex flex-col items-center max-w-md">
                  <div className="h-28 w-28 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-8 shadow-inner ring-4 ring-blue-100 animate-pulse">
                    <Sparkles size={52} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-light text-slate-800 tracking-tight">Community Hub</h3>
                  <p className="text-slate-500 text-[14px] mt-4 leading-relaxed font-normal">
                    Send and receive messages in real time. Choose from your joined communities on the left, check your DMs in the Chats tab, or discover new exciting groups!
                  </p>
                  <div className="w-full h-px bg-slate-200 my-8" />
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Lock size={12} />
                    <span>End-to-end connected and secured</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info sidebar - conditionally render based on DM or Group */}
          {selectedDM ? (
            <GroupInfoSidebar
              isOpen={showDMInfo}
              onClose={() => setShowDMInfo(false)}
              group={undefined}
              currentUserId={currentUserIdRef.current}
              onlineUsers={new Set()}
              dmParticipant={selectedDM.other_participant}
            />
          ) : (
            <GroupInfoSidebar
              isOpen={isInfoBarOpen}
              onClose={() => setIsInfoBarOpen(false)}
              group={communities.find((c) => c.id === selectedGroupId)}
              currentUserId={currentUserIdRef.current}
              onlineUsers={onlineUsers}
            />
          )}
        </main>
      </div>

      {/* Create Community Dialog */}
      <CreateCommunityDialog
        isOpen={showCreateCommunity}
        onOpenChange={setShowCreateCommunity}
      />

      {/* Rename Community Dialog */}
      <RenameCommunityDialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        community={communities.find((c) => c.id === selectedGroupId)}
        onRenamed={handleCommunityRenamed}
      />

      {/* Media Viewer */}
      <MediaViewer
        isOpen={mediaViewerOpen}
        onClose={() => {
          setMediaViewerOpen(false);
          setSelectedMedia(null);
        }}
        mediaUrl={selectedMedia?.url || ''}
        mediaType={selectedMedia?.type || ''}
        mediaName={selectedMedia?.name || ''}
        mediaSize={selectedMedia?.size || 0}
      />

      {/* Right-click context menu */}
      {contextMenu && (() => {
        const ctxMsg = messages.find((m) => m.id === contextMenu.messageId);
        const canDelete = ctxMsg
          ? String(ctxMsg.sender) === String(currentUserIdRef.current) || isCurrentUserAdmin
          : false;
        return (
          <div
            className="fixed z-50 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 min-w-[160px] animate-in fade-in zoom-in-95 duration-100"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {ctxMsg && (
              <button
                onClick={() => handleReplyToMessage(ctxMsg)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-slate-600 hover:bg-slate-50 font-medium transition-colors"
              >
                <Reply size={14} />
                Reply
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleDeleteMessage(contextMenu.messageId)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 font-medium transition-colors"
              >
                <Trash2 size={14} />
                Delete message
              </button>
            )}
          </div>
        );
      })()}

      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        group={selectedDiscoGroup}
        onJoin={handleJoinConfirm}
      />
    </DashboardShell>
  );
}
