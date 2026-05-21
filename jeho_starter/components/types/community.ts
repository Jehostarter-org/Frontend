export type CommunityItemType = "suggestion" | "active_group"

export interface CommunityItem {
  id: string
  type: CommunityItemType
  avatar: string
  title: string
  message: string
  timestamp: string
  suggestionId?: string
  groupChatCount?: number
  unreadCount?: number
}

export interface CommunityGroupsResponse {
  communities: CommunityItem[]
  total: number
}
