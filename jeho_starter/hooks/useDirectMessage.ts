import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import type { Message, Conversation } from "@/lib/api/messagesApiSlice";

export interface DMMessage {
    id: number;
    body: string;
    sender: {
        id: number;
        full_name: string;
    };
    reply_to?: DMMessage | null;
    service_card: any;
    is_read: boolean;
    created_at: string;
    attachments?: {
        id: number;
        url: string;
        filename: string;
        filesize: number;
    }[];
}

interface TypingEvent {
    type: "typing";
    user_id: number;
    is_typing: boolean;
}

interface ReadReceipt {
    type: "read_receipt";
    user_id: number;
    count: number;
}

export function useDirectMessage(conversationId: string | null) {
    const [messages, setMessages] = useState<DMMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<number[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const wsRef = useRef<WebSocket | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryRef = useRef(0);
    const closedRef = useRef(false);
    const maxRetries = 10;

    const connect = useCallback(() => {
        if (!conversationId) return;

        if (wsRef.current) {
            wsRef.current.close();
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.error("Not authenticated");
            return;
        }

        const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
        const ws = new WebSocket(
            `${wsBase}/ws/messaging/${conversationId}/?token=${token}`
        );
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            retryRef.current = 0;
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case "connected":
                        setUnreadCount(data.unread_count);
                        break;

                    case "chat_message":
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === data.message.id)) return prev;
                            return [...prev, data.message];
                        });
                        break;

                    case "message_deleted":
                        setMessages((prev) => prev.filter((m) => m.id !== data.message_id));
                        break;

                    case "typing":
                        setTypingUsers((prev) => {
                            if (data.is_typing) {
                                return prev.includes(data.user_id) ? prev : [...prev, data.user_id];
                            }
                            return prev.filter((id) => id !== data.user_id);
                        });
                        break;

                    case "read_receipt":
                        setMessages((prev) =>
                            prev.map((msg) =>
                                msg.sender.id === data.user_id && !msg.is_read
                                    ? { ...msg, is_read: true }
                                    : msg
                            )
                        );
                        break;

                    case "error":
                        toast.error(data.detail);
                        break;
                }
            } catch (err) {
                console.error("Failed to parse WebSocket message:", err);
            }
        };

        ws.onerror = () => {
            setIsConnected(false);
        };

        ws.onclose = () => {
            setIsConnected(false);
            if (closedRef.current) return;
            retryRef.current++;
            if (retryRef.current > maxRetries) return;
            const delay = Math.min(1000 * Math.pow(2, retryRef.current - 1), 30000);
            setTimeout(() => {
                if (!closedRef.current) connect();
            }, delay);
        };
    }, [conversationId]);

    useEffect(() => {
        closedRef.current = false;
        retryRef.current = 0;
        setMessages([]);
        setTypingUsers([]);
        connect();

        return () => {
            closedRef.current = true;
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback(
        (body: string, replyToId?: number | null, serviceCard?: any) => {
            const ws = wsRef.current;
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                toast.error("Not connected. Please try again.");
                return false;
            }

            ws.send(
                JSON.stringify({
                    type: "chat_message",
                    body: body.trim(),
                    reply_to_id: replyToId ?? null,
                    service_card: serviceCard || null,
                })
            );
            return true;
        },
        []
    );

    const sendTyping = useCallback(() => {
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "typing", is_typing: true }));

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            typingTimeoutRef.current = setTimeout(() => {
                if (ws?.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: "typing", is_typing: false }));
                }
            }, 2000);
        }
    }, []);

    const markAsRead = useCallback(() => {
        const ws = wsRef.current;
        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "mark_read" }));
        }
    }, []);

    const appendOptimisticMessage = useCallback((message: DMMessage) => {
        setMessages((prev) => [...prev, message]);
    }, []);

    const removeMessage = useCallback((messageId: number) => {
        setMessages((prev) => prev.filter((message) => message.id !== messageId));
    }, []);

    const sendDeleteMessage = useCallback((messageId: number) => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            return false;
        }
        ws.send(JSON.stringify({ type: "delete_message", message_id: messageId }));
        return true;
    }, []);

    return {
        messages,
        isConnected,
        typingUsers,
        unreadCount,
        sendMessage,
        sendTyping,
        markAsRead,
        appendOptimisticMessage,
        removeMessage,
        sendDeleteMessage,
    };
}
