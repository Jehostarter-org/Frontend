"use client";

import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import React, { useState, useMemo } from "react";
import EmptyInbox from "@/components/inbox/EmptyInbox";
import MessageItem from "@/components/inbox/MessageItem";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import CreateCommunityDialog from "@/components/inbox/CreateCommunityDialog";


import { mockMessages } from "./inbox-stats";
import type { Message } from "@/components/types/types";
import { TabButton } from "@/components/reuseables/tabsButton";

export default function InboxPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const unreadCount = useMemo(() => messages.filter((msg) => !msg.isRead).length, [messages]);

  const filteredMessages = useMemo(() => {
    let result = messages;

    if (activeTab === "unread") {
      result = result.filter((msg) => !msg.isRead);
    }
  
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      result = result.filter(msg => 
        msg.senderName.toLowerCase().includes(term) || 
        msg.content.toLowerCase().includes(term)
      );
    }

    return result;
  }, [activeTab, messages, searchQuery]);

  const handleRemoveMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#fcfdfe]">
        <header className="bg-white border-b border-gray-100 px-6 py-8 md:px-10">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                Messages
              </h1>
              <p className="text-gray-500 font-medium">
                You have <span className="text-teal-600 font-bold">{unreadCount} unread</span> conversations
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={() => setShowCreateCommunity(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg px-5 shadow-lg shadow-teal-600/20 transition-all active:scale-95" >
                <Plus className="mr-2 h-4 w-4 stroke-[3px]" />
                Create Community
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 md:px-10 py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex bg-gray-100 p-1 rounded-2xl w-full lg:w-auto">
              <TabButton 
                active={activeTab === "all"} 
                onClick={() => setActiveTab("all")}
                label="All Messages" 
              />
              <TabButton 
                active={activeTab === "unread"} 
                onClick={() => setActiveTab("unread")}
                label="Unread" 
                count={unreadCount}
                variant="unread"
              />
            </div>

            <div className="relative w-full lg:max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-teal-600 transition-colors" />
              <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-6 bg-white border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-teal-500/5 outline-none transition-all"
              />
            </div>
          </div>

          <div className="pb-20">
            {filteredMessages.length === 0 ? (
              <EmptyInbox isSearch={!!searchQuery} />
            ) : (
              <div className="grid gap-3">
                {filteredMessages.map((msg) => (
                  <MessageItem 
                    key={msg.id} 
                    message={msg} 
                    onAction={handleRemoveMessage} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <CreateCommunityDialog 
          isOpen={showCreateCommunity} 
          onOpenChange={setShowCreateCommunity} 
        />
      </div>
    </DashboardShell>
  );
}
