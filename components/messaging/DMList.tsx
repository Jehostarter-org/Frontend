"use client";

import Image from "next/image";
import { MessageCircle, Loader2 } from "lucide-react";
import { useGetInboxQuery } from "@/lib/api/messagesApiSlice";
import type { Conversation } from "@/lib/api/messagesApiSlice";

interface DMListProps {
    selectedId: number | null;
    onSelect: (conversation: Conversation) => void;
}

export function DMList({ selectedId, onSelect }: DMListProps) {
    const { data: conversations, isLoading, error } = useGetInboxQuery();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 px-6">
                <p className="text-sm text-red-500">Failed to load messages</p>
                <p className="text-xs text-slate-400 mt-1">Try refreshing the page</p>
            </div>
        );
    }

    if (!conversations?.length) {
        return (
            <div className="text-center py-12 px-6">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">No messages yet</p>
                <p className="text-xs text-slate-400 mt-1">
                    Start a conversation from a profile or service
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-slate-100">
            {conversations.map((conv) => (
                <button
                    key={conv.id}
                    onClick={() => onSelect(conv)}
                    className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left ${selectedId === conv.id ? "bg-slate-50 border-l-4 border-l-blue-500" : ""
                        }`}
                >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        {conv.other_participant?.avatar_url ? (
                            <Image
                                src={conv.other_participant.avatar_url}
                                alt=""
                                width={48}
                                height={48}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                                {conv.other_participant?.full_name?.charAt(0).toUpperCase() || "?"}
                            </div>
                        )}
                        {conv.other_participant?.is_gold && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-white" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-slate-800 truncate">
                                {conv.other_participant?.full_name || "Unknown User"}
                            </p>
                            {conv.last_message && (
                                <span className="text-[10px] text-slate-400 shrink-0">
                                    {new Date(conv.last_message.created_at).toLocaleDateString([], {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                            {conv.last_message?.body || "No messages yet"}
                        </p>
                    </div>

                    {/* Unread badge */}
                    {conv.unread_count > 0 && (
                        <div className="shrink-0 min-w-[20px] h-5 rounded-full bg-blue-500 flex items-center justify-center px-1.5">
                            <span className="text-[10px] font-bold text-white">
                                {conv.unread_count > 99 ? "99+" : conv.unread_count}
                            </span>
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}