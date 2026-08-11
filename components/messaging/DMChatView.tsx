"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Send, Loader2, Check, CheckCheck, ArrowLeft, Info, Wifi, WifiOff, MessageCircle, Reply, Trash2, X, File, FileText, Play, Music } from "lucide-react";
import { isMediaType } from "@/components/reuseables/media-viewer";
import MessageContent from "@/components/reuseables/MessageContent";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDeleteMessageMutation, useGetMessagesQuery, useMarkConversationReadMutation, useSendMessageMutation } from "@/lib/api/messagesApiSlice";
import { useDirectMessage, type DMMessage } from "@/hooks/useDirectMessage";
import type { Conversation } from "@/lib/api/messagesApiSlice";

interface DMChatViewProps {
    conversation: Conversation;
    onBack?: () => void;
    onInfoClick?: () => void;
}

export function DMChatView({ conversation, onBack, onInfoClick }: DMChatViewProps) {
    const [newMessage, setNewMessage] = useState("");
    const [replyingTo, setReplyingTo] = useState<DMMessage | null>(null);
    const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
    const [messageReadStates, setMessageReadStates] = useState<Record<number, "sent" | "delivered" | "read">>({});
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const conversationId = String(conversation.id);

    // Get current user ID
    useEffect(() => {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                setCurrentUserId(Number(user.id));
            }
        } catch { }
    }, []);

    // Fetch historical messages
    const { data: historyMessages = [], isLoading: isLoadingHistory, refetch } = useGetMessagesQuery(conversation.id);

    // Mark conversation as read via REST
    const [markRead] = useMarkConversationReadMutation();
    const [sendRestMessage, { isLoading: isSendingRest }] = useSendMessageMutation();
    const [deleteRestMessage] = useDeleteMessageMutation();

    // WebSocket for real-time
    const {
        messages: liveMessages,
        isConnected,
        typingUsers,
        sendMessage,
        sendTyping,
        markAsRead: wsMarkAsRead,
        removeMessage,
        sendDeleteMessage,
    } = useDirectMessage(conversationId);

    // Merge history + live messages (deduplicate by id)
    const allMessages = [...historyMessages, ...liveMessages]
        .filter((msg, index, self) => self.findIndex((m) => m.id === msg.id) === index)
        .filter((msg) => !deletedIds.has(msg.id))
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Mark messages as read when chat opens
    useEffect(() => {
        if (conversation.unread_count > 0) {
            markRead(conversation.id).catch(console.error);
            wsMarkAsRead();
        }
        refetch();
    }, [conversation.id, conversation.unread_count, markRead, wsMarkAsRead, refetch]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (allMessages.length > 0) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
            }, 100);
        }
    }, [allMessages.length]);

    // Simulate read receipts for optimistic messages
    useEffect(() => {
        allMessages.forEach((msg) => {
            if (!messageReadStates[msg.id]) {
                setMessageReadStates((prev) => ({ ...prev, [msg.id]: "sent" }));
                setTimeout(() => setMessageReadStates((prev) => ({ ...prev, [msg.id]: "delivered" })), 800);
                if (!msg.is_read && msg.sender?.id !== currentUserId) {
                    setTimeout(() => setMessageReadStates((prev) => ({ ...prev, [msg.id]: "read" })), 2000);
                }
            }
        });
    }, [allMessages, currentUserId]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        if (isConnected && sendMessage(trimmed, replyingTo?.id ?? null)) {
            setNewMessage("");
            setReplyingTo(null);
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        try {
            await sendRestMessage({
                conversation: conversation.id,
                body: trimmed,
                reply_to: replyingTo?.id ?? null,
            }).unwrap();
            setNewMessage("");
            setReplyingTo(null);
            refetch();
            setTimeout(() => inputRef.current?.focus(), 50);
        } catch {
            toast.error("Failed to send message");
        }
    };

    const handleTyping = useCallback(() => {
        sendTyping();
    }, [sendTyping]);

    const otherParticipant = conversation.other_participant;

    const handleDeleteMessage = async (messageId: number) => {
        setDeletedIds((prev) => new Set([...prev, messageId]));
        removeMessage(messageId);

        if (isConnected && sendDeleteMessage(messageId)) {
            return;
        }

        try {
            await deleteRestMessage({ conversation: conversation.id, messageId }).unwrap();
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

    if (!otherParticipant) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-500">Conversation not found</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#f8fafc] relative overflow-hidden">
            <div
                className="absolute inset-0 pointer-events-none opacity-70"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 18px 18px, rgba(15,23,42,0.045) 1.5px, transparent 1.5px)",
                    backgroundSize: "42px 42px",
                }}
            />
            {/* Header */}
            <header className="h-[60px] bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 border-b border-slate-200 z-10">
                <div className="flex items-center gap-3 min-w-0">
                    {onBack && (
                        <Button variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8" onClick={onBack}>
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <div className="relative">
                        {otherParticipant.avatar_url ? (
                            <Image
                                src={otherParticipant.avatar_url}
                                alt={otherParticipant.full_name}
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                                {otherParticipant.full_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isConnected ? "bg-green-500" : "bg-slate-400"}`} />
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold text-[15px] text-slate-800 truncate">
                            {otherParticipant.full_name}
                        </h3>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            {isConnected ? (
                                <>
                                    <Wifi size={10} /> Online
                                </>
                            ) : (
                                <>
                                    <WifiOff size={10} /> Offline
                                </>
                            )}
                            {typingUsers.includes(otherParticipant.id) && (
                                <span className="text-emerald-600 ml-1 animate-pulse">• typing...</span>
                            )}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" onClick={onInfoClick} title="Contact info">
                    <Info size={18} />
                </Button>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 custom-scrollbar relative z-10">
                {isLoadingHistory ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    </div>
                ) : allMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <MessageCircle className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">No messages yet</p>
                        <p className="text-xs text-slate-400 mt-1">Say hello to {otherParticipant.full_name.split(" ")[0]}!</p>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-1.5">
                        <div className="flex justify-center my-3 select-none">
                            <span className="bg-white text-[11px] font-medium text-slate-500 px-3 py-1 rounded-md shadow-sm border border-slate-100 uppercase tracking-wider">TODAY</span>
                        </div>
                        {allMessages.map((msg, idx) => {
                            const isMe = msg.sender?.id === currentUserId;
                            const prevMsg = idx > 0 ? allMessages[idx - 1] : null;
                            const isConsecutive = prevMsg && String(prevMsg.sender?.id) === String(msg.sender?.id);
                            const readState = messageReadStates[msg.id];

                            return (
                                <div
                                    key={msg.id}
                                    className={`flex w-full ${isMe ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-0.5" : "mt-2.5"} group/msg`}
                                >
                                    {!isMe && !isConsecutive && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-xs font-bold text-white shrink-0 mr-2 self-end">
                                            {msg.sender?.full_name?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                    )}
                                    {!isMe && isConsecutive && <div className="w-10 shrink-0" />}

                                    <div
                                        className={`relative max-w-[76%] sm:max-w-[66%] md:max-w-[56%] p-2 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${isMe
                                            ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none"
                                            : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                            }`}
                                    >
                                        {!isConsecutive && (
                                            <div className={`absolute top-0 w-2.5 h-3 overflow-hidden ${isMe ? "right-[-10px]" : "left-[-10px]"}`}>
                                                <div className={`w-3 h-3 rotate-45 transform origin-top-left ${isMe ? "bg-[#d9fdd3]" : "bg-white"}`} />
                                            </div>
                                        )}
                                        {msg.reply_to && (
                                            <button
                                                type="button"
                                                className={`mb-1.5 block w-full text-left px-2 py-1.5 rounded-md border-l-[3px] border-emerald-400 text-[12px] leading-snug ${isMe ? "bg-[#cdebbb]" : "bg-slate-100"}`}
                                            >
                                                <p className="font-bold text-emerald-600 truncate">
                                                    {msg.reply_to.sender?.full_name || "Message"}
                                                </p>
                                                <p className="text-slate-500 truncate">{msg.reply_to.body}</p>
                                            </button>
                                        )}
                                        <div className="text-[14px] leading-relaxed pr-12 whitespace-pre-wrap break-words">
                                            <MessageContent text={msg.body} />
                                        </div>

                                        {/* Attachment previews */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-1.5 space-y-1.5">
                                                {msg.attachments.map((att) => {
                                                    const type = att.filename;
                                                    const isImage = isMediaType(type, "image");
                                                    const isVideo = isMediaType(type, "video");
                                                    const isAudio = isMediaType(type, "audio");
                                                    const isPdf = isMediaType(type, "pdf");
                                                    const sizeLabel = att.filesize > 0 ? `${(att.filesize / 1024).toFixed(0)} KB` : "";

                                                    if (isImage) {
                                                        return (
                                                            <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
                                                                <img src={att.url} alt={att.filename} className="w-full max-h-[200px] object-cover rounded-lg" loading="lazy" />
                                                            </a>
                                                        );
                                                    }
                                                    if (isVideo) {
                                                        return (
                                                            <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="block relative overflow-hidden rounded-lg">
                                                                <video src={att.url} className="w-full max-h-[200px] object-cover rounded-lg" preload="metadata" />
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
                                                    // Generic file
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
                                        <div className="absolute bottom-1.5 right-2 flex items-center gap-1">
                                            <span className="text-[9px] text-slate-500">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </span>
                                            {isMe && (
                                                <span>
                                                    {readState === "sent" && <Check size={11} className="text-[#8696a0]" />}
                                                    {readState === "delivered" && <CheckCheck size={11} className="text-[#8696a0]" />}
                                                    {readState === "read" && <CheckCheck size={11} className="text-[#53bdeb]" />}
                                                </span>
                                            )}
                                        </div>

                                        <div className={`absolute -top-2 ${isMe ? "-left-16" : "-right-10"} opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 transition-opacity flex items-center gap-1`}>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReplyingTo(msg as DMMessage);
                                                    setTimeout(() => inputRef.current?.focus(), 50);
                                                }}
                                                className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200"
                                                title="Reply"
                                            >
                                                <Reply size={12} />
                                            </button>
                                            {isMe && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteMessage(msg.id)}
                                                    className="h-6 w-6 flex items-center justify-center rounded-full bg-white shadow border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
                                                    title="Delete"
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
            </div>

            {/* Input Area */}
            <footer className="bg-white/95 backdrop-blur-sm p-3 md:p-4 shrink-0 border-t border-slate-200 relative z-10">
                {replyingTo && (
                    <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                        <Reply size={14} className="text-blue-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-blue-600 leading-none mb-0.5">
                                {replyingTo.sender?.full_name || "Message"}
                            </p>
                            <p className="text-[12px] text-slate-500 truncate">{replyingTo.body}</p>
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
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        ref={inputRef}
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-emerald-300 transition-all"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newMessage.trim() || isSendingRest}
                        className="h-10 w-10 rounded-full bg-[#00a884] hover:bg-[#008f6b] text-white shrink-0 transition-all active:scale-95"
                    >
                        {isSendingRest ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px]" />}
                    </Button>
                </form>
            </footer>
        </div>
    );
}   
