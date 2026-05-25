export type MessageType = "direct" | "group" | "community_suggestion"

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar: string
  type: MessageType
  content: string
  timestamp: string
  isRead: boolean
  unreadCount?: number
  isGroupChat?: boolean
  groupChatCount?: number
  isCommunityRequest?: boolean
  link?: string
}

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  timestamp: string
  isOwn: boolean
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  location: string;
  quantity: number;
  stock: number;
}

export interface PathwayOption {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  requirementsTitle: string;
  requirements: string[];
}
