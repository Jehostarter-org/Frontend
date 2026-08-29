'use client';

/**
 * /dashboard/community/chat/[id]/page.tsx
 *
 * Real-time DM chat thread.
 * - Connects to ws://host/ws/messaging/<id>/?token=<jwt>
 * - Loads message history via REST on mount
 * - Falls back gracefully if WS is unavailable
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Paperclip, MoreVertical, Check, CheckCheck } from 'lucide-react';
import MessageContent from '@/components/reuseables/MessageContent';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '@/lib/features/auth/authSlice';
import {
    useGetConversationQuery,
    useGetMessagesQuery,
    useSendMessageMutation,
    useMarkConversationReadMutation,
    type Message,
    type ServiceCard,
} from '@/lib/api/messagesApiSlice';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWsUrl(conversationId: string, token: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const host = process.env.NEXT_PUBLIC_WS_URL ?? window.location.host;
    return `${protocol}://${host}/ws/messaging/${conversationId}/?token=${token}`;
}

function getInitials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function formatMessageTime(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
    return format(d, 'MMM d, h:mm a');
}

function dateDivider(dateStr: string) {
    const d = new Date(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMMM d, yyyy');
}

// ─── Service Card ─────────────────────────────────────────────────────────────

function ServiceCardBubble({ card }: { card: ServiceCard }) {
    return (
        <div className="max-w-[240px] rounded-xl border border-teal-200 bg-teal-50 p-3 text-xs">
            <p className="font-semibold text-teal-800 mb-1">{card.title ?? 'Service'}</p>
            {card.date ? <p className="text-teal-600">📅 {card.date}</p> : null}
            {card.price != null ? (
                <p className="text-teal-600">
                    💰 {card.currency} {card.price}
                </p>
            ) : null}
            {card.service_type ? (
                <span className="inline-block mt-1 bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full capitalize">
                    {card.service_type.replace(/_/g, ' ')}
                </span>
            ) : null}
        </div>
    );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({
    message,
    isOwn,
}: {
    message: Message;
    isOwn: boolean;
}) {
    return (
        <div className= {`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`
}>
    {/* Avatar */ }
{
    !isOwn && (
        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-semibold flex-shrink-0 mb-1" >
            { getInitials(message.sender.full_name) }
            </div>
      )
}

<div className={ `flex flex-col gap-1 max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}` }>
{
    message.service_card && (
        <ServiceCardBubble card={ message.service_card } />
        )}

{
    message.body && (
        <div
            className={
        `relative px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isOwn
            ? 'bg-[#d9fdd3] text-slate-900 rounded-br-sm'
            : 'bg-white border border-slate-200 text-gray-800 rounded-bl-sm'
        }`
    }
          >
        <span className={`absolute top-0 w-2.5 h-3 overflow-hidden ${isOwn ? 'right-[-10px]' : 'left-[-10px]'}`}>
            <span className={`w-3 h-3 rotate-45 transform origin-top-left ${isOwn ? 'bg-[#d9fdd3]' : 'bg-white'}`} />
        </span>
        <MessageContent text={message.body} />
        </div>
        )
}

{/* Timestamp + read receipt */ }
<div className="flex items-center gap-1" >
    <span className="text-[10px] text-gray-400" > { formatMessageTime(message.created_at) } </span>
{
    isOwn && (
        message.is_read
            ? <CheckCheck className="w-3 h-3 text-[#53bdeb]" />
              : <Check className="w-3 h-3 text-[#8696a0]" />
          )
}
</div>
    </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
    return (
        <div className= "flex items-end gap-2" >
        <div className="w-7 h-7 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1" >
                {
                    [0, 1, 2].map((i) => (
                        <span
            key= { i }
            className = "w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce"
            style = {{ animationDelay: `${i * 0.15}s` }}
                />
        ))
}
</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ChatPage() {
    const router = useRouter();
    const params = useParams();
    const conversationId = String(params.id);

    const token = useSelector(selectCurrentToken);

    // REST queries
    const { data: conversation } = useGetConversationQuery(Number(conversationId));
    const { data: initialMessages = [] } = useGetMessagesQuery(Number(conversationId));
    const [sendMessageRest] = useSendMessageMutation();
    const [markRead] = useMarkConversationReadMutation();

    // Local state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [connected, setConnected] = useState(false);
    const [otherTyping, setOtherTyping] = useState(false);

    const wsRef = useRef<WebSocket | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Seed messages from REST
    useEffect(() => {
        if (initialMessages.length > 0) {
            setMessages(initialMessages);
        }
    }, [initialMessages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, otherTyping]);

    // Mark read on mount
    useEffect(() => {
        markRead(Number(conversationId)).catch(() => {});
    }, [conversationId, markRead]);

    // ── WebSocket lifecycle ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!token || !conversationId) return;

        const url = getWsUrl(conversationId, token);
        console.log('[Chat] connecting to', url);
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[Chat] WS open');
            setConnected(true);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.type === 'connected') {
                    console.log('[Chat] connected, unread:', data.unread_count);
                }

                if (data.type === 'chat_message') {
                    const msg: Message = data.message;
                    setMessages((prev) => {
                        // Deduplicate by id
                        if (prev.some((m) => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                    // Auto-mark read
                    ws.send(JSON.stringify({ type: 'mark_read' }));
                }

                if (data.type === 'typing') {
                    setOtherTyping(data.is_typing);
                    if (data.is_typing) {
                        if (typingTimer.current) clearTimeout(typingTimer.current);
                        typingTimer.current = setTimeout(() => setOtherTyping(false), 3000);
                    }
                }

                if (data.type === 'read_receipt') {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.sender.id !== data.user_id ? { ...m, is_read: true } : m
                        )
                    );
                }
            } catch {
                // ignore malformed frames
            }
        };

        ws.onclose = (e) => {
            console.log('[Chat] WS closed', e.code);
            setConnected(false);
        };

        ws.onerror = (e) => {
            console.error('[Chat] WS error', e);
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [token, conversationId]);

    // ── Send ──────────────────────────────────────────────────────────────────────
    const handleSend = useCallback(async () => {
        const body = input.trim();
        if (!body) return;

        setInput('');

        if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'chat_message', body }));
        } else {
            // REST fallback
            try {
                const msg = await sendMessageRest({
                    conversation: Number(conversationId),
                    body,
                }).unwrap();
                setMessages((prev) => [...prev, msg]);
            } catch (err) {
                console.error('[Chat] REST send failed', err);
            }
        }
    }, [input, connected, conversationId, sendMessageRest]);

    // ── Typing indicator ──────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        if (connected && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'typing', is_typing: true }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // ── Render date dividers ───────────────────────────────────────────────────────
    const renderMessages = () => {
        let lastDate = '';
        return messages.map((msg) => {
            const msgDate = dateDivider(msg.created_at);
            const showDivider = msgDate !== lastDate;
            lastDate = msgDate;

            // Determine "own" by sender vs other_participant
            const isOwn = conversation
                ? msg.sender.id !== conversation.other_participant?.id
                : false;

            return (
                <div key= { msg.id } >
                { showDivider && (
                    <div className="flex items-center gap-3 my-4" >
                        <div className="flex-1 h-px bg-gray-100" />
                            <span className="text-[11px] text-gray-400 font-medium" > { msgDate } </span>
                                < div className = "flex-1 h-px bg-gray-100" />
                                    </div>
          )
    }
    <MessageBubble message={ msg } isOwn = { isOwn } />
        </div>
      );
});
  };

const other = conversation?.other_participant;

return (
    <div className= "flex flex-col h-[calc(100vh-64px)] bg-gray-50" >
    {/* ── Header ── */ }
    < div className = "bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0" >
        <button
          onClick={ () => router.push('/dashboard/community') }
className = "p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
    >
    <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

{/* Avatar */ }
<div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm flex-shrink-0" >
    { other? getInitials(other.full_name) : '?'}
    </div>

    < div className = "flex-1 min-w-0" >
        <p className="font-semibold text-gray-900 text-sm truncate" >
            { other?.full_name ?? 'Loading…'}
</p>
    < p className = "text-xs text-gray-400" >
        {
            connected
                ?<span className = "text-green-500">● Online</ span >
              : 'Connecting…'}
</p>
    </div>

{/* Service type badge */ }
{
    conversation?.service_type && (
        <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5 capitalize" >
            { conversation.service_type.replace(/_/g, ' ') }
            </span>
        )
}

<button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" >
    <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
        </div>

{/* ── Messages ── */ }
<div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" >
    {
        messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-gray-400"> No messages yet.Say hello!</ p >
    </div>
        )}

{ renderMessages() }

{ otherTyping && <TypingIndicator /> }
<div ref={ bottomRef } />
    </div>

{/* ── Input ── */ }
<div className="bg-white border-t border-gray-200 px-4 py-3 flex items-end gap-2 flex-shrink-0" >
    <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0" >
        <Paperclip className="w-5 h-5 text-gray-500" />
            </button>

            < div className = "flex-1 bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2" >
                <textarea
            ref={ inputRef }
value = { input }
onChange = { handleInputChange }
onKeyDown = { handleKeyDown }
placeholder = "Type a message…"
rows = { 1}
className = "w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none resize-none max-h-32"
style = {{ lineHeight: '1.5' }}
          />
    </div>

    < button
onClick = { handleSend }
disabled = {!input.trim()}
className = {`p-2.5 rounded-xl transition-colors flex-shrink-0 ${input.trim()
        ? 'bg-[#00a884] hover:bg-[#008f6b] text-white'
        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
    }`}
        >
    <Send className="w-4.5 h-4.5" />
        </button>
        </div>
        </div>
  );
}