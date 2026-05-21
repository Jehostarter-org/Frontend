"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "@/components/types/types";
import { ArrowLeft, Mic, Paperclip, Smile, Send } from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";



interface ChatClientProps {
  chatUser: {
    id: string;
    name: string;
    avatar: string;
  };
}

export default function ChatClient({ chatUser }: ChatClientProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(), 
      senderId: "currentUser",
      content: message,
      timestamp: new Date().toISOString(),
      isOwn: true
    };

    setChatMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  return (
    <DashboardShell>
      <div className='flex h-[calc(100vh-64px)] bg-white'>
        <main className='flex flex-1 flex-col'>
          <div className='flex items-center gap-4 border-b border-gray-200 bg-[#2C5F6F] px-6 py-4 text-white shadow-sm'>
            <Button variant="ghost" onClick={() => router.back()} className='hover:bg-white/10 p-2' >
              <ArrowLeft className='h-6 w-6' />
            </Button>
            <div className="relative">
              <Image
                src={chatUser.avatar || "/placeholder.svg"}
                alt={chatUser.name}
                width={40}
                height={40}
                className='h-10 w-10 rounded-full border-2 border-white/20 object-cover'
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2C5F6F] bg-green-500" />
            </div>
            <div>
              <h2 className='text-lg font-semibold leading-none'>{chatUser.name}</h2>
              <span className="text-xs text-teal-100">Online</span>
            </div>
          </div>

          <div ref={scrollRef} className='flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50' >
            {chatMessages.length === 0 ? (
              <div className='flex h-full flex-col items-center justify-center text-gray-400 space-y-2'>
                <div className="p-4 bg-gray-100 rounded-full">
                   <Smile className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm">Start your conversation with {chatUser.name}</p>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isOwn ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`} >
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${ msg.isOwn ? "bg-[#2C5F6F] text-white rounded-tr-none" : "bg-white text-gray-900 border border-gray-200 rounded-tl-none" }`}>
                    <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                    <span className={`text-[10px] mt-1 block ${msg.isOwn ? "text-teal-100" : "text-gray-400"}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className='border-t border-gray-100 bg-white p-4 pb-8 md:pb-4'>
            <div className='flex items-center gap-2 max-w-5xl mx-auto'>
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className='text-gray-400 hover:text-teal-600'>
                  <Smile className='h-5 w-5' />
                </Button>
                <Button variant="ghost" size="icon" className='text-gray-400 hover:text-teal-600'>
                  <Paperclip className='h-5 w-5' />
                </Button>
              </div>
              
              <Input
                placeholder='Type a message...'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className='flex-1 border-gray-200 focus:ring-teal-600 focus:border-teal-600 rounded-full px-6'
              />
              
              <Button onClick={handleSendMessage} disabled={!message.trim()} className={`${message.trim() ? "bg-[#2C5F6F] hover:bg-[#1e414c]" : "bg-gray-100 text-gray-400"} rounded-full h-10 w-10 p-0 transition-all`} >
                {message.trim() ? <Send className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </DashboardShell>
  );
}