export type CommunityItemType = "suggestion" | "active_group" | "discovery"

export interface CommunityItem {
  id: string
  type: CommunityItemType
  avatar: string
  title: string
  message: string
  timestamp?: string
  suggestionId?: string
  groupChatCount?: number
  unreadCount?: number
  description?: string
  memberCount?: number
  isPrivate?: boolean
}

export interface CommunityGroupsResponse {
  communities: CommunityItem[]
  total: number
}
