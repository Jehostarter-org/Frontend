"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import type { CommunityItem } from "@/components/types/community";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { Search, ArrowLeft, Send, MoreVertical, Hash, Info, Loader2, MessageSquare, Users, Globe } from "lucide-react";

// Components
import { ProfileQuickView } from "@/components/dashboard/community/ProfileQuickView";
import { SidebarItem } from "@/components/dashboard/community/communitySidebar";
import { JoinGroupModal } from "@/components/dashboard/community/joinGroupModal";
import { GroupInfoSidebar } from "@/components/dashboard/community/groupInfoSidebar";

// Real API
import {
  useGetCommunitiesQuery,
  useJoinCommunityMutation,
  useGetCommunityMessagesQuery,
  type CommunityMessage,
} from "@/lib/api/communityApiSlice";

// ── WebSocket hook ────────────────────────────────────────────────────────────

function useCommunityChat(communityId: string | null) {
  const [liveMessages, setLiveMessages] = useState<CommunityMessage[]>([]);
  const [isConnected,  setIsConnected]  = useState(false);
  const [typingUsers,  setTypingUsers]  = useState<string[]>([]);
  const wsRef        = useRef<WebSocket | null>(null);
  const typingTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load history from REST
  const { data: history = [], isLoading: isLoadingHistory } = useGetCommunityMessagesQuery(
    communityId!,
    { skip: !communityId },
  );

  // Seed live list when history loads.
  // Use a ref guard so this only fires once per community switch —
  // RTK Query returns a new array reference on every render even when
  // data hasn't changed, which would cause an infinite setState loop.
  const seededRef = useRef(false);
  useEffect(() => {
    if (history.length > 0 && !seededRef.current) {
      seededRef.current = true;
      setLiveMessages(history);
    }
  }, [history]);

  // Reset seed guard and messages when community changes
  useEffect(() => {
    seededRef.current = false;
    setLiveMessages([]);
  }, [communityId]);

  // Open / close WebSocket
  useEffect(() => {
    if (!communityId) return;

    wsRef.current?.close();

    const token =
      typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    if (!token) {
      toast.error("Not authenticated — cannot connect to chat.");
      return;
    }

    const wsBase = process.env.NEXT_PUBLIC_WS_URL ?? "ws://127.0.0.1:8000";
    const ws     = new WebSocket(`${wsBase}/ws/community/${communityId}/?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "message") {
          const incoming: CommunityMessage = {
            id:              data.id,
            community:       communityId,
            sender:          data.sender_id,
            sender_username: data.sender_username,
            sender_avatar:   data.sender_avatar ?? null,
            content:         data.content,
            created_at:      data.created_at,
          };
          setLiveMessages((prev) =>
            prev.some((m) => m.id === incoming.id) ? prev : [...prev, incoming],
          );
          setTypingUsers((prev) => prev.filter((u) => u !== data.sender_username));
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
      } catch {}
    };

    ws.onerror = () => setIsConnected(false);
    ws.onclose = () => setIsConnected(false);

    return () => {
      ws.close();
      Object.values(typingTimers.current).forEach(clearTimeout);
    };
  }, [communityId]);

  const sendMessage = useCallback((content: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("Not connected — try again in a moment.");
      return;
    }
    ws.send(JSON.stringify({ type: "message", content }));
  }, []);

  const sendTyping = useCallback(() => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "typing" }));
    }
  }, []);

  return { messages: liveMessages, isConnected, isLoadingHistory, typingUsers, sendMessage, sendTyping };
}

// ── Types ─────────────────────────────────────────────────────────────────────

type TabType = "groups" | "messages" | "discovery";

function apiToCommunityItem(c: any): CommunityItem {
  return {
    id:          c.id,
    title:       c.name,
    avatar:      c.cover_image ?? "",
    message:     c.description ?? "",
    unreadCount: 0,
    type:        c.is_member ? "active_group" : "discovery",
    description: c.description,
    memberCount: c.member_count,
    isPrivate:   c.visibility === "private",
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [activeTab,          setActiveTab]          = useState<TabType>("groups");
  const [selectedGroupId,    setSelectedGroupId]    = useState<string | null>(null);
  const [searchQuery,        setSearchQuery]        = useState("");
  const [newMessage,         setNewMessage]         = useState("");
  const [isInfoBarOpen,      setIsInfoBarOpen]      = useState(false);
  const [isJoinModalOpen,    setIsJoinModalOpen]    = useState(false);
  const [selectedDiscoGroup, setSelectedDiscoGroup] = useState<CommunityItem | null>(null);
  const [viewingUser,        setViewingUser]        = useState<any>(null);
  const [isProfileOpen,      setIsProfileOpen]      = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Real data
  const { data: apiCommunities = [], isLoading } = useGetCommunitiesQuery();
  const [joinCommunity] = useJoinCommunityMutation();

  // Only connect WebSocket for real group chats (not DMs)
  const isDM      = selectedGroupId?.startsWith("dm-") ?? false;
  const wsGroupId = selectedGroupId && !isDM ? selectedGroupId : null;
  const { messages, isConnected, isLoadingHistory, typingUsers, sendMessage, sendTyping } =
    useCommunityChat(wsGroupId);

  // Map API communities to CommunityItem list
  const communities = useMemo<CommunityItem[]>(
    () => apiCommunities.map((c: any) => apiToCommunityItem(c)),
    [apiCommunities],
  );

  // Sidebar list filtered by tab + search
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return communities.filter((item) => {
      if (!item.title.toLowerCase().includes(q)) return false;
      if (activeTab === "groups")    return item.type === "active_group";
      if (activeTab === "discovery") return item.type === "discovery";
      return false;
    });
  }, [communities, activeTab, searchQuery]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }),
        50,
      );
    }
  }, [messages]);

  // Handlers
  const chatHeader = useMemo(() => {
    if (!selectedGroupId) return null;
    if (isDM) {
      return { title: viewingUser?.name || "Direct Message", avatar: viewingUser?.avatar || "", status: "Online", isDM: true };
    }
    const group = communities.find((c) => c.id === selectedGroupId);
    return {
      title:  group?.title || "Community",
      avatar: group?.avatar || "",
      status: isConnected ? "Live" : "Connecting…",
      isDM:   false,
    };
  }, [selectedGroupId, communities, viewingUser, isConnected, isDM]);

  const handleItemClick = (item: CommunityItem) => {
    if (activeTab === "discovery") {
      setSelectedDiscoGroup(item);
      setIsJoinModalOpen(true);
    } else {
      setSelectedGroupId(item.id);
    }
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

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setNewMessage("");
  };

  // Render
  if (isLoading) return (
    <DashboardShell>
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell>
      <div className="flex h-[calc(100vh-120px)] overflow-hidden bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 mx-4 mb-4">

        {/* SIDEBAR */}
        <aside className={`${selectedGroupId ? "hidden md:flex" : "flex"} w-full md:w-[380px] flex-col border-r border-slate-100 bg-slate-50/30`}>
          <div className="p-8 space-y-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Hub</h2>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 bg-white border-none rounded-2xl shadow-sm focus:ring-4 focus:ring-teal-500/5 transition-all font-bold"
              />
            </div>

            <div className="flex bg-slate-200/50 p-1.5 rounded-2xl">
              {(["groups", "messages", "discovery"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedGroupId(null); }}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    activeTab === tab ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab === "groups"    && <Users size={12} />}
                  {tab === "messages"  && <MessageSquare size={12} />}
                  {tab === "discovery" && <Globe size={12} />}
                  <span className="hidden sm:inline">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8">
            <p className="px-2 mb-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{activeTab}</p>
            {filteredList.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-300 uppercase tracking-widest py-10">
                {activeTab === "groups" ? "You haven't joined any groups yet." : "No communities found."}
              </p>
            ) : (
              filteredList.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  isActive={selectedGroupId === item.id}
                  onClick={() => handleItemClick(item)}
                  isDM={activeTab === "messages"}
                />
              ))
            )}
          </div>
        </aside>

        {/* MAIN CHAT */}
        <main className="flex-1 flex flex-row bg-white relative">
          <div className="flex-1 flex flex-col border-r border-slate-50">
            {selectedGroupId && chatHeader ? (
              <>
                {/* Header */}
                <header className="flex items-center justify-between px-10 py-6 border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setSelectedGroupId(null)}>
                      <ArrowLeft size={20} />
                    </Button>
                    <div className="h-12 w-12 cursor-pointer" onClick={() => { setViewingUser(chatHeader); setIsProfileOpen(true); }}>
                      <SafeImage src={chatHeader.avatar} alt={chatHeader.title} width={48} height={48} className={`${chatHeader.isDM ? "rounded-full" : "rounded-2xl"} object-cover shadow-md`} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2 text-lg italic uppercase leading-none mb-1">
                        {chatHeader.title}
                        {chatHeader.isDM && <Badge className="bg-blue-50 text-blue-500 border-none text-[8px] px-2 font-black">DIRECT</Badge>}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"}`} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{chatHeader.status}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Button variant="ghost" size="icon" onClick={() => setIsInfoBarOpen((v) => !v)} className="hover:text-teal-600 rounded-full h-11 w-11">
                      <Info size={22} />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:text-teal-600 rounded-full h-11 w-11">
                      <MoreVertical size={22} />
                    </Button>
                  </div>
                </header>

                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 scroll-smooth">
                  {isLoadingHistory ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <MessageSquare size={64} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm italic">Start a conversation</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const currentUserId = typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
                      const isMe = msg.sender === currentUserId;
                      return (
                        <div key={msg.id} className={`flex items-end gap-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                          <div
                            className="h-10 w-10 flex-shrink-0 cursor-pointer"
                            onClick={() => {
                              setViewingUser({ id: msg.sender, name: msg.sender_username, avatar: msg.sender_avatar });
                              setIsProfileOpen(true);
                            }}
                          >
                            <SafeImage src={msg.sender_avatar ?? ""} alt={msg.sender_username} width={40} height={40} className="rounded-xl object-cover shadow-sm" />
                          </div>
                          <div className={`max-w-[70%] space-y-2 ${isMe ? "items-end" : "items-start"}`}>
                            {!isMe && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{msg.sender_username}</p>}
                            <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                              isMe
                                ? "bg-teal-600 text-white rounded-br-none"
                                : "bg-white text-slate-900 rounded-bl-none border border-slate-100"
                            }`}>
                              {msg.content}
                            </div>
                            <p className="text-[9px] font-bold text-slate-300 uppercase px-2 tracking-tighter">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Typing indicator */}
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold italic pl-14">
                      <span className="flex gap-0.5">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay} className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </span>
                      {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing…
                    </div>
                  )}
                </div>

                {/* Input */}
                <footer className="p-8 bg-white border-t border-slate-50">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-100 p-2.5 rounded-[2.5rem] focus-within:bg-white focus-within:ring-4 ring-teal-500/5 transition-all shadow-inner">
                    <Input
                      value={newMessage}
                      onChange={(e) => { setNewMessage(e.target.value); sendTyping(); }}
                      placeholder={isConnected ? "Type your message..." : "Connecting…"}
                      disabled={!isConnected && !isDM}
                      className="border-none bg-transparent focus-visible:ring-0 shadow-none text-sm font-bold px-6 h-12"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newMessage.trim() || (!isConnected && !isDM)}
                      className="h-12 w-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl shrink-0 transition-transform active:scale-90"
                    >
                      <Send size={20} />
                    </Button>
                  </form>
                </footer>
              </>
            ) : (
              /* Empty state */
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-50/10">
                <div className="h-24 w-24 bg-white rounded-[3rem] flex items-center justify-center text-teal-500 mb-8 shadow-2xl ring-1 ring-slate-100">
                  <Hash size={48} strokeWidth={2.5} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Community Hub</h3>
                <p className="text-slate-400 font-medium mt-4 max-w-xs leading-relaxed">
                  Connect with the community, chat with builders, or explore new opportunities in the discovery tab.
                </p>
              </div>
            )}
          </div>

          <GroupInfoSidebar
            isOpen={isInfoBarOpen}
            onClose={() => setIsInfoBarOpen(false)}
            group={communities.find((c) => c.id === selectedGroupId)}
          />
        </main>
      </div>

      {/* Modals */}
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        group={selectedDiscoGroup}
        onJoin={handleJoinConfirm}
      />

      <ProfileQuickView
        user={viewingUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onMessage={(userId) => {
          setActiveTab("messages");
          setSelectedGroupId(`dm-${userId}`);
          setIsProfileOpen(false);
        }}
      />
    </DashboardShell>
  );
}