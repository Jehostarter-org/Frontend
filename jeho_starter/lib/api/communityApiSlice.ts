// lib/api/communityApiSlice.ts
//
// Drop this file in — it covers both the REST endpoints your existing
// components already reference AND the new message-history endpoint.

import { apiSlice } from './apiSlice';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Community {
  id:               string;
  name:             string;
  slug:             string;
  description:      string;
  creator:          string;
  creator_username: string;
  country_code:     string;
  visibility:       'public' | 'private';
  cover_image:      string | null;
  is_active:        boolean;
  purpose:          string;
  rules:            string;
  member_count:     number;
  post_count:       number;
  is_member:        boolean;
  created_at:       string;
}

export interface CommunityMessage {
  id:              string;
  community:       string;
  sender:          string;
  sender_username: string;
  sender_avatar:   string | null;
  content:         string;
  created_at:      string;
}

export interface Post {
  id:              string;
  community:       string;
  author:          string;
  author_username: string;
  post_type:       string;
  content:         string;
  video_url:       string;
  images:          { id: string; image: string; caption: string }[];
  comments_count:  number;
  likes_count:     number;
  is_liked:        boolean;
  created_at:      string;
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const communityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // List all communities (public)
    getCommunities: builder.query<Community[], void>({
      query: () => '/community/',
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: [{ type: 'Community' as const, id: 'LIST' }],
    }),

    // Single community detail
    getCommunity: builder.query<Community, string>({
      query: (id) => `/community/${id}/`,
      providesTags: (_r, _e, id) => [{ type: 'Community' as const, id }],
    }),

    // Create a new community
    createCommunity: builder.mutation<Community, Partial<Community>>({
      query: (body) => ({ url: '/community/', method: 'POST', body }),
      invalidatesTags: [{ type: 'Community' as const, id: 'LIST' }],
    }),

    // Join a community
    joinCommunity: builder.mutation<void, string>({
      query: (id) => ({ url: `/community/${id}/join/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Community' as const, id },
        { type: 'Community' as const, id: 'LIST' },
      ],
    }),

    // Leave a community
    leaveCommunity: builder.mutation<void, string>({
      query: (id) => ({ url: `/community/${id}/leave/`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Community' as const, id },
        { type: 'Community' as const, id: 'LIST' },
      ],
    }),

    // Community members list
    getCommunityMembers: builder.query<any[], string>({
      query: (id) => `/community/${id}/members/`,
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
    }),

    // Message history — last 50 messages, oldest-first
    getCommunityMessages: builder.query<CommunityMessage[], string>({
      query: (id) => `/community/${id}/messages/`,
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: (_r, _e, id) => [{ type: 'CommunityMessages' as const, id }],
    }),

    // Feed (posts from all joined communities)
    getCommunityFeed: builder.query<Post[], void>({
      query: () => '/community/feed/',
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: [{ type: 'Post' as const, id: 'FEED' }],
    }),

    // Posts inside a community
    getCommunityPosts: builder.query<Post[], string>({
      query: (id) => `/community/${id}/posts/`,
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: (_r, _e, id) => [{ type: 'Post' as const, id }],
    }),

  }),
});

export const {
  useGetCommunitiesQuery,
  useGetCommunityQuery,
  useCreateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useGetCommunityMembersQuery,
  useGetCommunityMessagesQuery,
  useGetCommunityFeedQuery,
  useGetCommunityPostsQuery,
} = communityApiSlice;