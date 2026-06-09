export interface Notification {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  type: "comment" | "like" | "interest" | "cart" | "profile";
  message: string;
  secondaryMessage?: string;
  icon?: "heart" | "bell";
  timestamp: string;
  isRead: boolean;
}

export const mockNotifications: Notification[] = [
  {
    id: "1",
    user: {
      name: "Micheal",
      avatar: "/images/photo1.png",
    },
    type: "comment",
    message: "Commented: This product is nice",
    secondaryMessage: "Micheal Liked your comment",
    icon: "heart",
    timestamp: "WET,UTC+5:00",
    isRead: false,
  },
  {
    id: "2",
    user: {
      name: "Micheal",
      avatar: "/images/photo2.png",
    },
    type: "interest",
    message: "Micheal showed interest in your product",
    secondaryMessage: "Micheal added your product to cart",
    icon: "bell",
    timestamp: "WET,UTC+5:00",
    isRead: false,
  },
  {
    id: "3",
    user: {
      name: "Micheal",
      avatar: "/images/photo3.png",
    },
    type: "profile",
    message: "Micheal checked your profile",
    timestamp: "WET,UTC+5:00",
    isRead: true
  },
  {
    id: "4",
    user: {
      name: "Micheal",
      avatar: "/images/photo4.png",
    },
    type: "comment",
    message: "Commented: This product is nice",
    secondaryMessage: "Micheal Liked your comment",
    icon: "heart",
    timestamp: "WET,UTC+5:00",
    isRead: false,
  },
  {
    id: "5",
    user: {
      name: "Micheal",
      avatar: "/images/photo1.png",
    },
    type: "interest",
    message: "Micheal showed interest in your product",
    secondaryMessage: "Micheal added your product to cart",
    icon: "bell",
    timestamp: "WET,UTC+5:00",
    isRead: false,
  },
  {
    id: "6",
    user: {
      name: "Micheal",
      avatar: "/images/photo2.png",
    },
    type: "profile",
    message: "Micheal checked your profile",
    timestamp: "WET,UTC+5:00",
    isRead: true
  },
]
