"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { mockCommunities } from '@/app/dashboard/community/community-stats';

export interface Community {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  members: CommunityMember[];
  pendingRequests: CommunityRequest[];
  isPublic: boolean;
  location?: string;
  createdAt: string;
  category?: string;
  maxMembers?: number;
  tags?: string[];
}

export interface CommunityMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface CommunityRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message?: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface UserSuggestion {
  id: string;
  name: string;
  avatar: string;
  mutualFriends?: number;
  location?: string;
  isOnline?: boolean;
}

interface CommunityContextType {
  communities: Community[];
  userSuggestions: UserSuggestion[];
  myCommunities: Community[];
  availableCommunities: Community[];
  createCommunity: (communityData: Omit<Community, 'id' | 'members' | 'pendingRequests' | 'createdAt'>) => void;
  sendJoinRequest: (communityId: string, userId: string, message?: string) => void;
  approveJoinRequest: (communityId: string, requestId: string) => void;
  rejectJoinRequest: (communityId: string, requestId: string) => void;
  addMember: (communityId: string, member: CommunityMember) => void;
  removeMember: (communityId: string, memberId: string) => void;
  getCommunityById: (communityId: string) => Community | undefined;
  refreshCommunities: () => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

// Mock user suggestions data
const mockUserSuggestions: UserSuggestion[] = [
  {
    id: "user1",
    name: "Sarah Johnson",
    avatar: "/images/photo1.png",
    mutualFriends: 5,
    location: "Lagos, Nigeria",
    isOnline: true
  },
  {
    id: "user2",
    name: "Mike Chen",
    avatar: "/images/photo2.png",
    mutualFriends: 3,
    location: "Abuja, Nigeria",
    isOnline: false
  },
  {
    id: "user3",
    name: "Grace Okafor",
    avatar: "/images/photo3.png",
    mutualFriends: 8,
    location: "Port Harcourt, Nigeria",
    isOnline: true
  },
  {
    id: "user4",
    name: "David Williams",
    avatar: "/images/photo4.png",
    mutualFriends: 2,
    location: "Kano, Nigeria",
    isOnline: true
  }
];

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [userSuggestions] = useState<UserSuggestion[]>(mockUserSuggestions);

  useEffect(() => {
    const initializedCommunities = mockCommunities.map(community => ({
      id: community.id,
      name: community.title || "Community Group",
      description: community.message,
      creatorId: "current-user",
      creatorName: "You",
      creatorAvatar: "/images/photo1.png",
      members: [
        {
          id: "current-user",
          name: "You",
          avatar: "/images/photo1.png",
          role: "admin" as const,
          joinedAt: new Date().toLocaleString()
        }
      ],
      pendingRequests: [],
      isPublic: true,
      location: "Lagos, Nigeria",
      createdAt: community.timestamp ?? new Date().toLocaleString(),
      category: "General",
      maxMembers: 100,
      tags: ["community", "social"]
    }));
    setCommunities(initializedCommunities);
  }, []);

  const myCommunities = useMemo(() => communities.filter(community =>
    community.members.some(member => member.id === "current-user")
  ), [communities]);

  const availableCommunities = useMemo(() => communities.filter(community =>
    !community.members.some(member => member.id === "current-user")
  ), [communities]);

  const createCommunity = (communityData: Omit<Community, 'id' | 'members' | 'pendingRequests' | 'createdAt'>) => {
    const newCommunity: Community = {
      ...communityData,
      id: Date.now().toString(),
      members: [
        {
          id: "current-user",
          name: "You",
          avatar: "/images/photo1.png",
          role: "admin",
          joinedAt: new Date().toLocaleString()
        }
      ],
      pendingRequests: [],
      createdAt: new Date().toLocaleString()
    };

    setCommunities(prev => [...prev, newCommunity]);
  };

  const sendJoinRequest = (communityId: string, userId: string, message?: string) => {
    const userSuggestion = userSuggestions.find(user => user.id === userId);
    if (!userSuggestion) return;

    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        const newRequest: CommunityRequest = {
          id: Date.now().toString(),
          userId,
          userName: userSuggestion.name,
          userAvatar: userSuggestion.avatar,
          message,
          requestedAt: new Date().toLocaleString(),
          status: 'pending'
        };
        return {
          ...community,
          pendingRequests: [...community.pendingRequests, newRequest]
        };
      }
      return community;
    }));
  };

  const approveJoinRequest = (communityId: string, requestId: string) => {
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        const request = community.pendingRequests.find(req => req.id === requestId);
        if (request) {
          const newMember: CommunityMember = {
            id: request.userId,
            name: request.userName,
            avatar: request.userAvatar,
            role: 'member',
            joinedAt: new Date().toLocaleString()
          };

          return {
            ...community,
            members: [...community.members, newMember],
            pendingRequests: community.pendingRequests.filter(req => req.id !== requestId)
          };
        }
      }
      return community;
    }));
  };

  const rejectJoinRequest = (communityId: string, requestId: string) => {
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          pendingRequests: community.pendingRequests.filter(req => req.id !== requestId)
        };
      }
      return community;
    }));
  };

  const addMember = (communityId: string, member: CommunityMember) => {
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          members: [...community.members, member]
        };
      }
      return community;
    }));
  };

  const removeMember = (communityId: string, memberId: string) => {
    setCommunities(prev => prev.map(community => {
      if (community.id === communityId) {
        return {
          ...community,
          members: community.members.filter(member => member.id !== memberId)
        };
      }
      return community;
    }));
  };

  const getCommunityById = (communityId: string) => {
    return communities.find(community => community.id === communityId);
  };

  const refreshCommunities = () => {
    setCommunities(prev => [...prev]);
  };

  const value = React.useMemo(() => ({
    communities,
    userSuggestions,
    myCommunities,
    availableCommunities,
    createCommunity,
    sendJoinRequest,
    approveJoinRequest,
    rejectJoinRequest,
    addMember,
    removeMember,
    getCommunityById,
    refreshCommunities
  }), [communities, userSuggestions, myCommunities, availableCommunities]);

  return (
    <CommunityContext.Provider value={value}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (context === undefined) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
