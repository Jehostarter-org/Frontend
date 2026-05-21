export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

export const mockGroupMessages: Record<string, ChatMessage[]> = {
  "1": [ // Matches Community ID "1"
    {
      id: "m1",
      senderId: "user-2",
      senderName: "Sarah Chen",
      senderAvatar: "https://i.pravatar.cc/150?u=sarah",
      content: "Has anyone tried the new Move compiler update on Sui yet?",
      timestamp: "10:30 AM",
      isMe: false,
    },
    {
      id: "m2",
      senderId: "me",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/150?u=me",
      content: "I just started testing it this morning. The error messages are way more descriptive now.",
      timestamp: "10:32 AM",
      isMe: true,
    },
    {
      id: "m3",
      senderId: "user-3",
      senderName: "Alex River",
      senderAvatar: "https://i.pravatar.cc/150?u=alex",
      content: "Agreed! It saved me about an hour of debugging on my DEX project.",
      timestamp: "10:35 AM",
      isMe: false,
    },
  ],
};