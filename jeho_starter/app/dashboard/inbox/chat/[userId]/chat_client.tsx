"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { DMChatView } from "@/components/messaging/DMChatView";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useGetInboxQuery, type Conversation } from "@/lib/api/messagesApiSlice";

interface ChatClientProps {
  chatUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function ChatClient({ chatUser }: ChatClientProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);

  const { data: conversations, isLoading, error } = useGetInboxQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!conversations?.length) return;
    const found = conversations.find(
      (conv) => String(conv.other_participant?.id) === String(chatUser.id)
    );
    if (found) setConversation(found);
  }, [conversations, chatUser.id]);

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      </DashboardShell>
    );
  }

  if (error || !conversation) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] bg-white text-center px-6">
          <p className="text-sm font-medium text-slate-600">
            Could not open this conversation.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {chatUser.name} hasn't started a chat with you yet.
          </p>
          <button
            onClick={() => router.push("/dashboard/community")}
            className="mt-4 text-sm font-semibold text-[#2C5F6F] hover:underline"
          >
            Go to messages
          </button>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-64px)] bg-white">
        <DMChatView conversation={conversation} onBack={() => router.back()} />
      </div>
    </DashboardShell>
  );
}
