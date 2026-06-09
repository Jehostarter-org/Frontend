// community-dm-messages.ts
export const mockDMMessages: Record<string, any[]> = {
  "dm-user-123": [
    {
      id: "dm1",
      senderId: "user-123",
      senderName: "Sami Byron",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sami",
      content: "Yo! How's the progress on the MedVault project?",
      timestamp: "Yesterday",
      isMe: false,
    },
    {
      id: "dm2",
      senderId: "me",
      senderName: "You",
      senderAvatar: "https://i.pravatar.cc/150?u=me",
      content: "Just finished the EMR dashboard. Moving on to the Paystack setup today.",
      timestamp: "9:00 AM",
      isMe: true,
    },
    {
      id: "dm3",
      senderId: "user-123",
      senderName: "Sami Byron",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sami",
      content: "Nice! Let me know if you need help with the API keys.",
      timestamp: "9:05 AM",
      isMe: false,
    },
  ],
};