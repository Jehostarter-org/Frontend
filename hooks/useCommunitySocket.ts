/**
 * useCommunitySocket.ts
 *
 * Central hook that owns the WebSocket connection for community chat.
 * Replaces any inline `useEffect` + `WebSocket` calls scattered across
 * page/component files.
 *
 * Responsibilities
 * ─────────────────
 * 1. Open / close the WS connection when `communityId` changes.
 * 2. Dispatch incoming `message` events into local state AND track unread
 *    counts for groups that are not currently active.
 * 3. Track `user_joined` / `user_left` events → `onlineUsers` map.
 * 4. Expose helpers: `sendMessage`, `sendTyping`, `deleteMessage`.
 *
 * Usage
 * ─────
 * const {
 *   messages,
 *   onlineUsers,       // Set<string>  — user_ids currently connected
 *   unreadCounts,      // Record<communityId, number>
 *   markAsRead,        // (communityId: string) => void
 *   sendMessage,
 *   sendTyping,
 *   deleteMessage,
 *   isConnected,
 * } = useCommunitySocket({ communityId, token, activeCommunityId });
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { CommunityMessage } from "@/lib/api/communityApiSlice";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OnlineUser {
    user_id: string;
    username: string;
}

interface UseCommunitySocketOptions {
    /** The community room to connect to. Pass null/undefined to stay disconnected. */
    communityId: string | null | undefined;
    /** JWT access token for WS authentication. */
    token: string | null | undefined;
    /**
     * The community the user is *currently looking at*.
     * Messages for this community are NOT counted as unread.
     */
    activeCommunityId: string | null | undefined;
    /** Called for every inbound chat message (use to append to your message list). */
    onMessage?: (msg: CommunityMessage) => void;
    /** Called when a message is soft-deleted remotely. */
    onMessageDeleted?: (messageId: string) => void;
    /** Called when someone is typing (debounce display in the caller). */
    onTyping?: (username: string) => void;
}

interface UseCommunitySocketReturn {
    /** Online user_ids for the current community room. */
    onlineUsers: Set<string>;
    /**
     * Unread message counts per community id.
     * Only increments for communities that are NOT `activeCommunityId`.
     */
    unreadCounts: Record<string, number>;
    /** Reset the unread count for a community (call when user switches to it). */
    markAsRead: (communityId: string) => void;
    sendMessage: (content: string, replyToId?: string) => void;
    sendTyping: () => void;
    deleteMessage: (messageId: string) => void;
    isConnected: boolean;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCommunitySocket({
    communityId,
    token,
    activeCommunityId,
    onMessage,
    onMessageDeleted,
    onTyping,
}: UseCommunitySocketOptions): UseCommunitySocketReturn {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

    // Keep a stable ref to activeCommunityId so the ws `onmessage` closure
    // always sees the current value without needing to reconnect.
    const activeCommunityIdRef = useRef(activeCommunityId);
    useEffect(() => { activeCommunityIdRef.current = activeCommunityId; }, [activeCommunityId]);

    // ── Mark as read ───────────────────────────────────────────────────────────
    const markAsRead = useCallback((cid: string) => {
        setUnreadCounts((prev) => {
            if (!prev[cid]) return prev;
            const next = { ...prev };
            delete next[cid];
            return next;
        });
    }, []);

    // ── WS lifecycle ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!communityId || !token) return;

        const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
        const url = `${wsBase}/ws/community/${communityId}/?token=${token}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            setIsConnected(true);
            // Reset online presence for the new room
            setOnlineUsers(new Set());
        };

        ws.onclose = () => {
            setIsConnected(false);
            setOnlineUsers(new Set());
        };

        ws.onerror = (err) => {
            console.error("[WS Community] error", err);
        };

        ws.onmessage = (event) => {
            let data: any;
            try { data = JSON.parse(event.data); } catch { return; }

            switch (data.type) {
                // ── Incoming chat message ──────────────────────────────────────────
                case "message": {
                    const msg: CommunityMessage = {
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

                    onMessage?.(msg);

                    // Only increment unread if the user isn't currently in this room
                    if (activeCommunityIdRef.current !== communityId) {
                        setUnreadCounts((prev) => ({
                            ...prev,
                            [communityId]: (prev[communityId] ?? 0) + 1,
                        }));
                    }
                    break;
                }

                // ── Soft-delete propagation ────────────────────────────────────────
                case "message_deleted": {
                    onMessageDeleted?.(data.message_id);
                    break;
                }

                // ── Typing indicator ───────────────────────────────────────────────
                case "typing": {
                    onTyping?.(data.username);
                    break;
                }

                // ── Presence: user connected ───────────────────────────────────────
                case "user_joined": {
                    setOnlineUsers((prev) => {
                        const next = new Set(prev);
                        next.add(data.user_id);
                        return next;
                    });
                    break;
                }

                // ── Presence: user disconnected (NEW event from backend) ───────────
                case "user_left": {
                    setOnlineUsers((prev) => {
                        const next = new Set(prev);
                        next.delete(data.user_id);
                        return next;
                    });
                    break;
                }

                default:
                    break;
            }
        };

        return () => {
            ws.close();
            wsRef.current = null;
            setIsConnected(false);
            setOnlineUsers(new Set());
        };
        // Re-run only when room or token changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [communityId, token]);

    // ── Outbound helpers ───────────────────────────────────────────────────────

    const sendMessage = useCallback((content: string, replyToId?: string) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({
            type: "message",
            content,
            reply_to_id: replyToId ?? null,
        }));
    }, []);

    const sendTyping = useCallback(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: "typing" }));
    }, []);

    const deleteMessage = useCallback((messageId: string) => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;
        wsRef.current.send(JSON.stringify({ type: "delete_message", message_id: messageId }));
    }, []);

    return {
        onlineUsers,
        unreadCounts,
        markAsRead,
        sendMessage,
        sendTyping,
        deleteMessage,
        isConnected,
    };
}