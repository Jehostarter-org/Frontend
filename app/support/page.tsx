"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, Wifi, WifiOff, Headphones, ArrowLeft, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useAuth } from "@/components/contexts/auth-context";
import {
    useStartSupportMutation,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkConversationReadMutation,
} from "@/lib/api/messagesApiSlice";
import { useDirectMessage } from "@/hooks/useDirectMessage";

// When a support thread has been idle for this long, the user's view resets to
// a fresh chat (the admin portal still keeps the full history).
const INACTIVE_MS = 2 * 60 * 60 * 1000; // 2 hours

export default function SupportPage() {
    const router = useRouter();
    const { user, isLoggedIn } = useAuth();

    const [conversationId, setConversationId] = useState<number | null>(null);
    const [newMessage, setNewMessage] = useState("");
    const [startError, setStartError] = useState<string | null>(null);
    const [resetAt, setResetAt] = useState<number | null>(null);
    const startedRef = useRef(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

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
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const myId = Number(user?.id);
    const isMe = (senderId: unknown) => Number(senderId) === myId;

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
    const visibleMessages = resetAt === null
        ? allMessages
        : allMessages.filter((m) => new Date(m.created_at).getTime() >= resetAt);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (visibleMessages.length > 0) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
            }, 100);
        }
    }, [visibleMessages.length]);

    const handleTyping = useCallback(() => {
        sendTyping();
    }, [sendTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = newMessage.trim();
        if (!trimmed || !conversationId) return;

        if (isConnected && sendMessage(trimmed)) {
            setNewMessage("");
            setTimeout(() => inputRef.current?.focus(), 50);
            return;
        }

        try {
            await sendRestMessage({ conversation: conversationId, body: trimmed }).unwrap();
            setNewMessage("");
            refetch();
            setTimeout(() => inputRef.current?.focus(), 50);
        } catch {
            toast.error("Failed to send message. Check your connection.");
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

    return (
        <DashboardShell>
            <div className="flex h-[calc(100vh-64px)] bg-[#f8fafc] relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none opacity-70"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 18px 18px, rgba(15,23,42,0.045) 1.5px, transparent 1.5px)",
                        backgroundSize: "42px 42px",
                    }}
                />

                {/* Header */}
                <header className="h-[60px] bg-white/95 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 border-b border-slate-200 z-10 absolute top-0 left-0 right-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <Button variant="ghost" size="icon" className="md:hidden rounded-full h-8 w-8" onClick={() => router.push("/dashboard")}>
                            <ArrowLeft size={20} />
                        </Button>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white font-semibold">
                                <Headphones size={18} />
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isConnected ? "bg-green-500" : "bg-slate-400"}`} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-semibold text-[15px] text-slate-800 truncate">Jehostarter Support</h3>
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
                                {typingUsers.length > 0 && (
                                    <span className="text-emerald-600 ml-1 animate-pulse">• typing...</span>
                                )}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 pt-[76px] space-y-2 custom-scrollbar relative z-10 w-full">
                    {isStarting ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : startError ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <p className="text-sm text-slate-600">{startError}</p>
                            <Button onClick={retryStart} className="mt-4 gap-2">
                                <RefreshCw size={16} /> Try again
                            </Button>
                        </div>
                    ) : isLoadingHistory ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : visibleMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                <MessageCircle className="h-8 w-8 text-slate-400" />
                            </div>
                            {resetAt !== null && allMessages.length > 0 ? (
                                <>
                                    <p className="text-sm text-slate-500">New support session</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Your previous conversation was closed. Describe your issue below and our team will get back to you.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500">No messages yet</p>
                                    <p className="text-xs text-slate-400 mt-1">Describe your issue below and our team will get back to you.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-1.5">
                            {visibleMessages.map((msg, idx) => {
                                const mine = isMe(msg.sender?.id);
                                const prevMsg = idx > 0 ? visibleMessages[idx - 1] : null;
                                const isConsecutive = prevMsg && String(prevMsg.sender?.id) === String(msg.sender?.id);
                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex w-full ${mine ? "justify-end" : "justify-start"} ${isConsecutive ? "mt-0.5" : "mt-2.5"}`}
                                    >
                                        {!mine && !isConsecutive && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mr-2 self-end">
                                                <Headphones size={14} />
                                            </div>
                                        )}
                                        {!mine && isConsecutive && <div className="w-10 shrink-0" />}
                                        <div
                                            className={`relative max-w-[76%] sm:max-w-[66%] md:max-w-[56%] p-2 rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] ${
                                                mine
                                                    ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none"
                                                    : "bg-white text-slate-900 rounded-tl-none border border-slate-100"
                                            }`}
                                        >
                                            <div className="text-[14px] leading-relaxed pr-12 whitespace-pre-wrap break-words">
                                                {msg.body}
                                            </div>
                                            <div className="absolute bottom-1.5 right-2 text-[9px] text-slate-500">
                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Input */}
                <footer className="bg-white/95 backdrop-blur-sm p-3 md:p-4 shrink-0 border-t border-slate-200 relative z-10 absolute bottom-0 left-0 right-0">
                    <form onSubmit={handleSend} className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                            }}
                            placeholder="Describe your issue or ask a question…"
                            className="flex-1 bg-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-cyan-300 transition-all"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!newMessage.trim() || isSendingRest || !conversationId}
                            className="h-10 w-10 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shrink-0 transition-all active:scale-95"
                        >
                            {isSendingRest ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="translate-x-[1px]" />}
                        </Button>
                    </form>
                </footer>
            </div>
        </DashboardShell>
    );
}
