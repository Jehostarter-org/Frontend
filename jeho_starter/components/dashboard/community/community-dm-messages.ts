import { ChatMessage } from "./message-community"

export const mockDMMessages: Record<string, ChatMessage[]> = {
  // Key format matches your handleDirectMessage logic: `dm-${userId}`
  "dm-user_1": [
    {
      id: "dm1",
      senderId: "user_1",
      senderName: "Sarah Chen",
      senderAvatar: "https://i.pravatar.cc/150?u=sarah",
      content: "Hey! I saw your post about the Sui Move update. Do you have a link to the docs?",
      timestamp: "Yesterday, 2:45 PM",
      isMe: false,
    },
    {
      id: "dm2",
      senderId: "me",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/150?u=me",
      content: "Sure thing! It's in the official Sui repo under 'move-language'.",
      timestamp: "Yesterday, 3:00 PM",
      isMe: true,
    },
    {
      id: "dm3",
      senderId: "user_1",
      senderName: "Sarah Chen",
      senderAvatar: "https://i.pravatar.cc/150?u=sarah",
      content: "Perfect, thanks! Let me know if you want to collaborate on a test script.",
      timestamp: "Today, 10:15 AM",
      isMe: false,
    }
  ],
  "dm-user_2": [
    {
      id: "dm4",
      senderId: "user_2",
      senderName: "Alex River",
      senderAvatar: "https://i.pravatar.cc/150?u=alex",
      content: "The liquidity pool logic is ready for review.",
      timestamp: "2h ago",
      isMe: false,
    }
  ]
};