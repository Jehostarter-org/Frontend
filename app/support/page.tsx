"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Send, Loader2, Wifi, WifiOff, Headphones, ArrowLeft, MessageCircle,
    RefreshCw, Paperclip, Check, CheckCheck, Reply, Trash2, X,
    File, FileText, Play, Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/components/contexts/auth-context";
import {
    useStartSupportMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useSendMessageWithAttachmentsMutation,
    useMarkConversationReadMutation,
    useDeleteMessageMutation,
} from "@/lib/api/messagesApiSlice";
import { useDirectMessage, type DMMessage } from "@/hooks/useDirectMessage";
import MessageContent from "@/components/reuseables/MessageContent";
import { isMediaType } from "@/components/reuseables/media-viewer";
import { SafeImage } from "@/components/reuseables/SafeImage";

// When a support thread has been idle for this long, the user's view resets to
// a fresh chat (the admin portal still keeps the full history).
const INACTIVE_MS = 2 * 60 * 60 * 1000; // 2 hours

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_FILE_EXTENSIONS = "image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv";

interface PendingMedia {
    file: File;
    preview: string | null;
}

function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(bytes: number): string {
    if (!bytes || bytes <= 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
    if (!file.type && file.name.includes(".")) return true;
    const allowed = [
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
        "video/mp4", "video/webm", "video/ogg", "video/quicktime",
        "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "text/plain", "text/csv",
    ];
    if (!allowed.includes(file.type)) {
        toast.error("Unsupported file type", { description: `"${file.name.split(".").pop()?.toUpperCase()}" files are not allowed.` });
        return false;
    }
    return true;
}

export default function SupportPage() {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();

    const [conversationId, setConversationId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState<DMMessage | null>(null);
    const [pendingMedia, setPendingMedia] = useState<PendingMedia | null>(null);
    const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
    const [messageReadStates, setMessageReadStates] = useState<Record<number, "sent" | "delivered">>({});
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [startError, setStartError] = useState<string | null>(null);
    const [resetAt, setResetAt] = useState<number | null>(null);
    const startedRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingUrlRef = useRef<string | null>(null);

    const resetKey = conversationId ? `support_reset_${conversationId}` : null;

    const [startSupport, { isLoading: isStarting }] = useStartSupportMutation();

    // Live WebSocket for the open thread
    const {
        messages: liveMessages,
        isConnected,
        typingUsers,
        sendMessage,
        sendTyping,
        markAsRead,
        removeMessage,
        sendDeleteMessage,
    } = useDirectMessage(conversationId ? String(conversationId) : null);

    // Historical messages — poll every 10s only while the socket is down
    const { data: historyMessages = [], isLoading: isLoadingHistory, refetch } = useGetMessagesQuery(
        conversationId ?? -1,
        {
            skip: !conversationId,
            pollingInterval: isConnected ? 0 : 10000,
            refetchOnMountOrArgChange: true,
        }
    );

    const [markRead] = useMarkConversationReadMutation();
    const [sendRestMessage, { isLoading: isSendingRest }] = useSendMessageMutation();
    const [sendAttachments, { isLoading: isSendingAttachments }] = useSendMessageWithAttachmentsMutation();
    const [deleteRestMessage] = useDeleteMessageMutation();

    // Open (or resume) the user's support thread once
    useEffect(() => {
        if (!isLoggedIn || startedRef.current) return;
        startedRef.current = true;
        startSupport({})
            .unwrap()
            .then((res) => setConversationId(res.conversation_id))
            .catch(() => setStartError("Could not open the support chat. Please try again."));
    }, [isLoggedIn, startSupport]);

    // Mark the thread as read when it opens
    useEffect(() => {
        if (conversationId) {
            markRead(conversationId).catch(console.error);
            markAsRead();
            refetch();
        }
    }, [conversationId, markRead, markAsRead, refetch]);

    // Merge history + live messages, dedupe by id, sort chronologically
    const allMessages = [...historyMessages, ...liveMessages]
        .filter((msg, index, self) => self.findIndex((m) => m.id === msg.id) === index)
        .filter((msg) => !deletedIds.has(msg.id))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // ULID ids are strings — compare as strings or every own message looks "not mine"
    const myId = user?.id;
    const isMe = (msg: DMMessage) => String(msg.sender?.id) === String(myId);

    // Restore the last reset boundary for this conversation (if any)
    useEffect(() => {
        if (!resetKey) return;
        const stored = localStorage.getItem(resetKey);
        setResetAt(stored ? Number(stored) : null);
    }, [resetKey]);

    // When the thread has been idle for INACTIVE_MS, start a fresh session:
    // hide prior messages from the user's view (admin portal keeps full history).
    useEffect(() => {
        if (!conversationId || !resetKey || isStarting || isLoadingHistory) return;
        if (allMessages.length === 0) return;
        const lastActivityMs = Math.max(...allMessages.map((m) => new Date(m.created_at).getTime() || 0));
        const inactive = (Date.now() - lastActivityMs) >= INACTIVE_MS;
        const alreadyFresh = resetAt !== null && (Date.now() - resetAt) < INACTIVE_MS;
        if (inactive && !alreadyFresh) {
            const now = Date.now();
            localStorage.setItem(resetKey, String(now));
            setResetAt(now);
        }
    }, [conversationId, resetKey, isStarting, isLoadingHistory, allMessages, resetAt]);

    // Only show messages from the current session (after the last reset)
    const visibleMessages = (resetAt === null
        ? allMessages
        : allMessages.filter((m) => new Date(m.created_at).getTime() >= resetAt)) as DMMessage[];

    // Scroll to bottom on new messages
    useEffect(() => {
        if (visibleMessages.length > 0) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
            }, 100);
        }
    }, [visibleMessages.length]);

    // Simulated sent → delivered progression for newly sent messages.
    // "Read" ticks are driven by the real backend is_read flag only.
    const processedReceipts = useRef<Set<number>>(new Set());
    useEffect(() => {
        const timeouts: ReturnType<typeof setTimeout>[] = [];
        visibleMessages.forEach((msg) => {
            if (processedReceipts.current.has(msg.id)) return;
            processedReceipts.current.add(msg.id);
            timeouts.push(setTimeout(() => setMessageReadStates((prev) => ({ ...prev, [msg.id]: "sent" })), 0));
            timeouts.push(setTimeout(() => setMessageReadStates((prev) => ({ ...prev, [msg.id]: "delivered" })), 800));
        });
        return () => timeouts.forEach(clearTimeout);
    }, [visibleMessages]);

    // Revoke any pending object URL when it is removed
    useEffect(() => {
        return () => {
            if (pendingUrlRef.current) URL.revokeObjectURL(pendingUrlRef.current);
        };
    }, []);

    const handleTyping = useCallback(() => {
        sendTyping();
    }, [sendTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!conversationId) return;
        if (isSendingRest || isSendingAttachments || isUploadingFile) return;

        const trimmed = newMessage.trim();

        // Sending media — must go through REST with FormData
        if (pendingMedia) {
            setIsUploadingFile(true);
            try {
                const formData = new FormData();
                formData.append("conversation", String(conversationId));
                formData.append("body", trimmed || pendingMedia.file.name);
                if (replyingTo) formData.append("reply_to", String(replyingTo.id));
                formData.append("uploaded_images", pendingMedia.file);

                await sendAttachments(formData).unwrap();
                clearPendingMedia();
                setReplyingTo(null);
                setNewMessage("");
                refetch();
            } catch {
                toast.error("Failed to send file");
            } finally {
                setIsUploadingFile(false);
            }
            return;
        }

        if (!trimmed) return;

        if (isConnected && sendMessage(trimmed, replyingTo?.id ?? null)) {
            setNewMessage("");
            setReplyingTo(null);
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        try {
            await sendRestMessage({
                conversation: conversationId,
                body: trimmed,
                reply_to: replyingTo?.id ?? null,
            }).unwrap();
            setNewMessage("");
            setReplyingTo(null);
            refetch();
            setTimeout(() => inputRef.current?.focus(), 50);
        } catch {
            toast.error("Failed to send message. Check your connection.");
        }
    };

    const clearPendingMedia = () => {
        if (pendingUrlRef.current) {
            URL.revokeObjectURL(pendingUrlRef.current);
            pendingUrlRef.current = null;
        }
        setPendingMedia(null);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!validateFileSize(file)) return;
        if (!validateFileType(file)) return;

        clearPendingMedia();
        const isPreviewable =
            isMediaType(file.name, "image") || isMediaType(file.name, "video");
        const preview = isPreviewable ? URL.createObjectURL(file) : null;
        pendingUrlRef.current = preview;
        setPendingMedia({ file, preview });
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (!conversationId) return;
        setDeletedIds((prev) => new Set([...prev, messageId]));
        removeMessage(messageId);
        try {
            if (isConnected && sendDeleteMessage(messageId)) {
                return;
            }
            await deleteRestMessage({ conversation: conversationId, messageId }).unwrap();
            refetch();
        } catch {
            setDeletedIds((prev) => {
                const next = new Set(prev);
                next.delete(messageId);
                return next;
            });
            toast.error("Could not delete message");
        }
    };

    const retryStart = () => {
        setStartError(null);
        startedRef.current = false;
        startSupport({})
            .unwrap()
            .then((res) => setConversationId(res.conversation_id))
            .catch(() => setStartError("Could not open the support chat. Please try again."));
    };

    const pendingIsImage = pendingMedia ? isMediaType(pendingMedia.file.name, "image") : false;
    const pendingIsVideo = pendingMedia ? isMediaType(pendingMedia.file.name, "video") : false;
    const sendingAnything = isSendingRest || isSendingAttachments || isUploadingFile;

    return (
        <DashboardShell>
            <div className="h-[calc(100dvh-100px)] min-h-[480px] flex flex-col overflow-hidden bg-[#efeae2] rounded-xl shadow-xl border border-slate-200">
                {/* Header */}
                <header className="h-[60px] shrink-0 bg-[#f0f2f5] flex items-center justify-between px-3 sm:px-5 border-b border-black/5">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full h-8 w-8 shrink-0"
                            onClick={() => router.push("/dashboard")}
                        >
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white font-semibold">
                                <Headphones size={18} />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#f0f2f5] ${isConnected ? "bg-green-500" : "bg-slate-400"}`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-[15px] text-slate-800 truncate">Jehostarter Support</h3>
                            <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                {typingUsers.length > 0 ? (
                                    <span className="text-emerald-600 animate-pulse">typing...</span>
                                ) : isConnected ? (
                                    <>
                                        <Wifi size={10} /> Online
                                    </>
                                ) : (
                                    <>
                                        <WifiOff size={10} /> Offline
                                    </>
                                )}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar">
                    {isStarting ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : startError ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <p className="text-sm text-slate-600">{startError}</p>
                            <Button onClick={retryStart} className="mt-4 gap-2">
                                <RefreshCw size={16} /> Try again
                            </Button>
                        </div>
                    ) : isLoadingHistory ? (
                        <div className="h-full flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : visibleMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                                <MessageCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            {resetAt !== null && allMessages.length > 0 ? (
                                <>
                                    <p className="text-sm text-slate-600">New support session</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                        Your previous conversation was closed. Describe your issue below and our team will get back to you.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-600">No messages yet</p>
                                    <p className="text-xs text-slate-400 mt-1 max-w-xs">Describe your issue below and our team will get back to you.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="w-full flex flex-col justify-end px-3 sm:px-8 py-4 space-y-1.5">
                            {resetAt !== null && (
                                <div className="flex justify-center my-1 select-none">
                                    <span className="bg-white/80 text-[10px] font-bold text-slate-500 px-3 py-1 rounded-full shadow-sm border border-slate-200 uppercase tracking-wider">
                                        New support session
                                    </span>
                                </div>
                            )}
                            {visibleMessages.map((msg, idx) => {
                                const mine = isMe(msg);
                                const prevMsg = idx > 0 ? visibleMessages[idx - 1] : null;
                                const isConsecutive = prevMsg && String(prevMsg.sender?.id) === String(msg.sender?.id);
                                const simulated = messageReadStates[msg.id];
                                const readState = msg.is_read ? "read" : simulated || null;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${mine ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-0.5" : "mt-2.5"} group/msg`}
                                    >
                                        {!mine && !isConsecutive && (
                                            <div className="w-8 h-8 shrink-0 mr-2 self-end">
                                                {msg.sender?.avatar_url ? (
                                                    <SafeImage
                                                        src={msg.sender.avatar_url}
                                                        alt={msg.sender.full_name || "Support"}
                                                        width={32}
                                                        height={32}
                                                        className="rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[#00a884] flex items-center justify-center">
                                                        <Headphones size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {!mine && isConsecutive && <div className="w-10 shrink-0" />}

                                        <div className={`relative max-w-[85%] sm:max-w-[72%] md:max-w-[62%] p-2 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${mine
                                            ? `bg-[#d9fdd3] text-slate-900 ${isConsecutive ? "rounded-tr-lg" : "rounded-tr-none"}`
                                            : `bg-white text-slate-900 ${isConsecutive ? "rounded-tl-lg" : "rounded-tl-none"}`
                                        }`}>
                                            {!isConsecutive && (
                                                <div className={`absolute top-0 w-2.5 h-3 overflow-hidden ${mine ? "right-[-10px]" : "left-[-10px]"}`}>
                                                    <div className={`w-3 h-3 rotate-45 transform origin-top-left ${mine ? "bg-[#d9fdd3]" : "bg-white"}`} />
                                                </div>
                                            )}

                                            {msg.reply_to && (
                                                <div className={`mb-1.5 block w-full text-left px-2 py-1.5 rounded-md border-l-[3px] border-emerald-400 text-[12px] leading-snug ${mine ? "bg-[#cdebbb]" : "bg-slate-100"}`}>
                                                    <p className="font-bold text-emerald-600 truncate">
                                                        {msg.reply_to.sender?.full_name || "Message"}
                                                    </p>
                                                    <p className="text-slate-500 truncate">{msg.reply_to.body || "📎 Attachment"}</p>
                                                </div>
                                            )}

                                            {msg.body && (
                                                <div className="text-[14px] leading-relaxed pr-12 whitespace-pre-wrap break-words">
                                                    <MessageContent text={msg.body} />
                                                </div>
                                            )}

                                            {/* Attachment previews */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-1.5 space-y-1.5">
                                                    {msg.attachments.map((att) => {
                                                        const type = att.filename;
                                                        const isImage = isMediaType(type, "image");
                                                        const isVideo = isMediaType(type, "video");
                                                        const isAudio = isMediaType(type, "audio");
                                                        const isPdf = isMediaType(type, "pdf");
                                                        const sizeLabel = formatBytes(att.filesize);

                                                        if (isImage) {
                                                            return (
                                                                <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                                                                    <img
                                                                        src={att.url}
                                                                        alt={att.filename}
                                                                        className="w-full max-h-[220px] object-cover rounded-lg"
                                                                        loading="lazy"
                                                                    />
                                                                </a>
                                                            );
                                                        }
                                                        if (isVideo) {
                                                            return (
                                                                <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block relative overflow-hidden rounded-lg">
                                                                    <video src={att.url} className="w-full max-h-[220px] object-cover rounded-lg" preload="metadata" />
                                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg">
                                                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                                                            <Play size={16} className="text-slate-800 ml-0.5" fill="currentColor" />
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            );
                                                        }
                                                        if (isAudio) {
                                                            return (
                                                                <div key={att.id} className="flex items-center gap-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2.5">
                                                                    <a href={att.url} target="_blank" rel="noreferrer" className="w-8 h-8 shrink-0 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors">
                                                                        <Play size={12} className="text-blue-600 ml-0.5" fill="currentColor" />
                                                                    </a>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-[11px] font-semibold text-slate-700 truncate">{att.filename}</p>
                                                                        <p className="text-[9px] text-slate-400">{sizeLabel || "Audio"}</p>
                                                                    </div>
                                                                    <Music size={12} className="text-slate-300 shrink-0" />
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white/90 border border-slate-200 rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:border-blue-200 transition-colors">
                                                                <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${isPdf ? "bg-red-100" : "bg-slate-100"}`}>
                                                                    {isPdf ? <FileText size={14} className="text-red-500" /> : <File size={14} className="text-slate-500" />}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[11px] font-semibold text-slate-700 truncate">{att.filename}</p>
                                                                    <p className="text-[9px] text-slate-400">{isPdf ? "PDF • " : ""}{sizeLabel || "File"}</p>
                                                                </div>
                                                            </a>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Timestamp + read receipts */}
                                            <div className="absolute bottom-1.5 right-2 flex items-center gap-1 select-none">
                                                <span className="text-[9px] text-slate-500">{formatTime(msg.created_at)}</span>
                                                {mine && (
                                                    <span className="flex -ml-0.5">
                                                        {readState === "read" ? (
                                                            <CheckCheck size={11} className="text-[#53bdeb]" />
                                                        ) : (
                                                            <Check size={11} className="text-[#8696a0]" />
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Hover actions: reply + delete */}
                                            <div className={`absolute -top-2 ${mine ? "-left-14" : "-right-14"} opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity flex items-center gap-1`}>
                                                <button
                                                    type="button"
                                                    onClick={() => { setReplyingTo(msg); setTimeout(() => inputRef.current?.focus(), 50); }}
                                                    className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200"
                                                    title="Reply"
                                                >
                                                    <Reply size={12} />
                                                </button>
                                                {mine && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMessage(msg.id)}
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

                            {typingUsers.length > 0 && (
                                <div className="flex items-center gap-2 mt-1.5 pl-1">
                                    <div className="w-3 h-3 bg-[#d9fdd3] rounded-full flex items-center justify-center">
                                        <Headphones size={8} className="text-slate-600" />
                                    </div>
                                    <span className="h-7 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:120ms]" />
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:240ms]" />
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input */}
                <footer className="shrink-0 bg-[#f0f2f5] pr-3 sm:px-5 pb-3 pt-1.5">
                    {replyingTo && (
                        <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-white border-l-4 border-emerald-400 rounded-lg shadow-sm">
                            <Reply size={14} className="text-emerald-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-emerald-600 leading-none mb-0.5">
                                    {replyingTo.sender?.full_name || "Message"}
                                </p>
                                <p className="text-[12px] text-slate-500 truncate">{replyingTo.body || "📎 Attachment"}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setReplyingTo(null)}
                                className="shrink-0 h-5 w-5 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    {/* Pending media preview (WhatsApp-style) */}
                    {pendingMedia && (
                        <div className="relative mb-2 inline-block rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                            {pendingIsImage && pendingMedia.preview ? (
                                <img
                                    src={pendingMedia.preview}
                                    alt="Selected file"
                                    className="h-28 w-40 sm:h-32 sm:w-48 object-cover"
                                />
                            ) : pendingIsVideo && pendingMedia.preview ? (
                                <div className="relative h-28 w-40 sm:h-32 sm:w-48">
                                    <video src={pendingMedia.preview} className="w-full h-full object-cover" preload="metadata" muted />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                            <Play size={14} className="text-slate-800 ml-0.5" fill="currentColor" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-16 w-48 sm:w-64 flex items-center gap-3 px-4">
                                    <div className="w-10 h-10 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <File size={16} className="text-slate-500" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[12px] font-semibold text-slate-800 truncate">{pendingMedia.file.name}</p>
                                        <p className="text-[10px] text-slate-400">{formatBytes(pendingMedia.file.size)}</p>
                                    </div>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={clearPendingMedia}
                                disabled={sendingAnything}
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-800 text-white shadow-md flex items-center justify-center hover:bg-slate-700 disabled:opacity-50"
                                title="Remove"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_FILE_EXTENSIONS}
                            onChange={handleFileSelect}
                            disabled={!conversationId || sendingAnything}
                            className="hidden"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={!conversationId || sendingAnything}
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:bg-black/5 rounded-full h-11 w-11 text-slate-600 shrink-0"
                            title="Share file"
                        >
                            {isUploadingFile || isSendingAttachments
                                ? <Loader2 size={20} className="animate-spin" />
                                : <Paperclip size={20} />}
                        </Button>
                        <input
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                            placeholder={pendingMedia ? "Add a caption..." : "Type a message"}
                            disabled={!conversationId}
                            className="flex-1 bg-white rounded-full px-4 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-300 shadow-sm transition-all"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={(!newMessage.trim() && !pendingMedia) || sendingAnything || !conversationId}
                            className="h-11 w-11 rounded-full bg-[#00a884] hover:bg-[#008f6b] text-white shrink-0 transition-all active:scale-95"
                        >
                            {sendingAnything ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px]" />}
                        </Button>
                    </form>
                </footer>
            </div>
        </DashboardShell>
    );
}