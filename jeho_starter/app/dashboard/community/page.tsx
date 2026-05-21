"use client";

import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/reuseables/SafeImage";
import type { CommunityItem } from "@/components/types/community";
import React, { useState, useEffect, useMemo, useRef } from "react";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { Search, ArrowLeft, Send, MoreVertical, Hash, Info, Loader2, MessageSquare, Users, Globe } from "lucide-react";

// Components & Data
import { mockCommunities } from "./community-stats";
import { mockGroupMessages, ChatMessage } from "../../../components/dashboard/community/message-community";
import { mockDMMessages } from "@/components/dashboard/community/community-dm-messages";
import { ProfileQuickView } from "@/components/dashboard/community/ProfileQuickView";
import { SidebarItem } from "@/components/dashboard/community/communitySidebar";
import { JoinGroupModal } from "@/components/dashboard/community/joinGroupModal";
import { GroupInfoSidebar } from "@/components/dashboard/community/groupInfoSidebar";

type TabType = "groups" | "messages" | "discovery";

export default function CommunityPage() {
  const [communities, setCommunities] = useState<CommunityItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("groups");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInfoBarOpen, setIsInfoBarOpen] = useState(false);
  // Modal & Profile States
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [selectedDiscoGroup, setSelectedDiscoGroup] = useState<CommunityItem | null>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCommunities(mockCommunities);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      const isDM = selectedGroupId.startsWith('dm-');
      const messages = isDM 
        ? (mockDMMessages[selectedGroupId] || []) 
        : (mockGroupMessages[selectedGroupId] || []);
      
      setChatMessages(messages);
      // Ensure smooth scroll to bottom on load
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }
  }, [selectedGroupId]);

  const chatHeader = useMemo(() => {
    if (!selectedGroupId) return null;
    const isDM = selectedGroupId.startsWith('dm-');
    if (isDM) {
      return { 
        title: viewingUser?.name || "Direct Message", 
        avatar: viewingUser?.avatar || "", 
        status: "Online", 
        isDM: true 
      };
    }
    const group = communities.find(c => c.id === selectedGroupId);
    return { 
      title: group?.title || "Community", 
      avatar: group?.avatar || "", 
      status: "Active Discussion", 
      isDM: false 
    };
  }, [selectedGroupId, communities, viewingUser]);

  const filteredList = useMemo(() => {
    const search = searchQuery.toLowerCase();
    return communities.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(search);
      if (!matchesSearch) return false;
      if (activeTab === "groups") return item.type === "active_group";
      if (activeTab === "messages") return item.type === "dm";
      if (activeTab === "discovery") return item.type === "discovery";
      return false;
    });
  }, [communities, activeTab, searchQuery]);

  const handleItemClick = (item: CommunityItem) => {
    if (activeTab === "discovery") {
      setSelectedDiscoGroup(item);
      setIsJoinModalOpen(true);
    } else {
      setSelectedGroupId(item.id);
    }
  };

  const handleJoinConfirm = (groupId: string) => {
    setCommunities(prev => prev.map(c => 
      c.id === groupId ? { ...c, type: "active_group" as const } : c
    ));
    setActiveTab("groups");
    setSelectedGroupId(groupId);
    toast.success("Joined community successfully!");
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const myMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/150?u=me",
      content: newMessage,
      timestamp: "Just now",
      isMe: true,
    };
    setChatMessages(prev => [...prev, myMsg]);
    setNewMessage("");
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 50);
  };

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
           
        <aside className={`${selectedGroupId ? 'hidden md:flex' : 'flex'} w-full md:w-[380px] flex-col border-r border-slate-100 bg-slate-50/30`}>
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
                  {tab === "groups" && <Users size={12} />}
                  {tab === "messages" && <MessageSquare size={12} />}
                  {tab === "discovery" && <Globe size={12} />}
                  <span className="hidden sm:inline">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-8">
            <p className="px-2 mb-2 text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{activeTab}</p>
            {filteredList.map((item) => (
              <SidebarItem 
                key={item.id} 
                item={item} 
                isActive={selectedGroupId === item.id} 
                onClick={() => handleItemClick(item)} 
                isDM={activeTab === "messages"}
              />
            ))}
          </div>
        </aside>

        {/* MAIN CHAT AREA */}
        <main className="flex-1 flex flex-row bg-white relative">
          <div className="flex-1 flex flex-col border-r border-slate-50">
            {selectedGroupId && chatHeader ? (
              <>
                <header className="flex items-center justify-between px-10 py-6 border-b border-slate-50 bg-white/80 backdrop-blur-xl sticky top-0 z-10">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setSelectedGroupId(null)}>
                      <ArrowLeft size={20} />
                    </Button>
                    <div className="h-12 w-12 cursor-pointer" onClick={() => { setViewingUser(chatHeader); setIsProfileOpen(true); }}>
                      <SafeImage src={chatHeader.avatar} alt={chatHeader.title} width={48} height={48} className={`${chatHeader.isDM ? 'rounded-full' : 'rounded-2xl'} object-cover shadow-md`} />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tight flex items-center gap-2 text-lg italic uppercase leading-none mb-1">
                        {chatHeader.title}
                        {chatHeader.isDM && <Badge className="bg-blue-50 text-blue-500 border-none text-[8px] px-2 font-black">DIRECT</Badge>}
                      </h3>
                      <div className="flex items-center gap-2">
                         <span className={`h-2 w-2 rounded-full ${chatHeader.isDM ? 'bg-emerald-500' : 'bg-teal-400'} animate-pulse`} />
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{chatHeader.status}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <Button variant="ghost" size="icon" className="hover:text-teal-600 rounded-full h-11 w-11"><Info size={22}/></Button>
                    <Button variant="ghost" size="icon" className="hover:text-teal-600 rounded-full h-11 w-11"><MoreVertical size={22}/></Button>
                  </div>
                </header>

                <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/20 scroll-smooth">
                  {chatMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-20">
                      <MessageSquare size={64} className="mb-4" />
                      <p className="font-black uppercase tracking-widest text-sm italic">Start a conversation</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className={`flex items-end gap-4 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}>
                        <div className="h-10 w-10 flex-shrink-0 cursor-pointer" onClick={() => { setViewingUser(msg); setIsProfileOpen(true); }}>
                          <SafeImage src={msg.senderAvatar} alt={msg.senderName} width={40} height={40} className="rounded-xl object-cover shadow-sm" />
                        </div>
                        <div className={`max-w-[70%] space-y-2 ${msg.isMe ? "items-end" : "items-start"}`}>
                          {!msg.isMe && <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{msg.senderName}</p>}
                          <div className={`p-5 rounded-[2rem] text-sm font-medium leading-relaxed shadow-sm ${
                            msg.isMe ? "bg-teal-600 text-white rounded-br-none" : "bg-white text-slate-900 rounded-bl-none border border-slate-100"
                          }`}>
                            {msg.content}
                          </div>
                          <p className="text-[9px] font-bold text-slate-300 uppercase px-2 tracking-tighter">{msg.timestamp}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <footer className="p-8 bg-white border-t border-slate-50">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-4 bg-slate-100 p-2.5 rounded-[2.5rem] focus-within:bg-white focus-within:ring-4 ring-teal-500/5 transition-all shadow-inner">
                    <Input 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Type your message..." 
                      className="border-none bg-transparent focus-visible:ring-0 shadow-none text-sm font-bold px-6 h-12"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()} className="h-12 w-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl shrink-0 transition-transform active:scale-90">
                      <Send size={20} />
                    </Button>
                  </form>
                </footer>
              </>
            ) : (
            /* EMPTY STATE */
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
            group={communities.find(c => c.id === selectedGroupId)} 
          />
        </main>
      </div>

      {/* MODALS */}
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
            const dmId = `dm-${userId}`;
            setActiveTab("messages");
            setSelectedGroupId(dmId);
            setIsProfileOpen(false);
        }} 
      />
    </DashboardShell>
  );
}