"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, X, Check } from "lucide-react";
import type { Message } from "@/components/types/types";

interface MessageItemProps {
  message: Message;
  onAction: (id: string) => void;
}

export default function MessageItem({ message, onAction }: MessageItemProps) {
  const isUnread = !message.isRead;

  const renderAction = () => {
    if (message.isCommunityRequest) {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-[#2C5F6F] hover:bg-[#234A56]"
            onClick={() => onAction(message.id)}
          >
            <Check className="mr-1 h-4 w-4" />
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction(message.id)}
          >
            <X className="mr-1 h-4 w-4" />
            Decline
          </Button>
        </div>
      );
    }
    return (
      <Button
        size="sm"
        variant="ghost"
        className="text-gray-400 hover:text-gray-600"
        onClick={() => onAction(message.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <div
      className={`flex items-start gap-4 rounded-lg border bg-white p-4 ${
        isUnread ? "border-l-4 border-l-[#2C5F6F]" : ""
      }`}
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={message.senderAvatar} alt={message.senderName} />
        <AvatarFallback>{message.senderName.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">
            {message.senderName}
          </span>
          {message.isGroupChat && (
            <Badge variant="secondary" className="text-xs">
              <Users className="mr-1 h-3 w-3" />
              {message.groupChatCount} members
            </Badge>
          )}
          {isUnread && message.unreadCount && (
            <Badge className="bg-red-500 text-xs">{message.unreadCount}</Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 truncate">{message.content}</p>
        <span className="text-xs text-gray-400">{message.timestamp}</span>
      </div>

      <div className="flex items-center gap-2">{renderAction()}</div>
    </div>
  );
}