// lib/api/communityApiSlice.ts

import { apiSlice } from './apiSlice';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  creator: string;
  creator_username: string;
  country_code: string;
  visibility: 'public' | 'private';
  cover_image: string | null;
  is_active: boolean;
  purpose: string;
  rules: string;
  member_count: number;
  post_count: number;
  is_member: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface CommunityMessage {
  id: string;
  community: string;
  sender: string;
  sender_username: string;
  sender_avatar: string | null;
  content: string;
  reply_to: { id: string; sender_username: string; content: string } | null;
  attachment: string | null;
  attachment_url: string | null;
  attachment_name: string;
  attachment_type: string;
  attachment_size: number;
  reactions: Record<string, string[]>;
  created_at: string;
}

export interface Post {
  id: string;
  community: string;
  author: string;
  author_username: string;
  post_type: string;
  content: string;
  video_url: string;
  images: { id: string; image: string; caption: string }[];
  comments_count: number;
  likes_count: number;
  is_liked: boolean;
  created_at: string;
}

export interface InviteLink {
  invite_url: string;
  token: string;
  expires_at: string;
}

export interface InviteEmailResult {
  sent: string[];
  skipped: string[];
  detail: string;
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const communityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getCommunities: builder.query<Community[], void>({
      query: () => '/community/',
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: [{ type: 'Community' as const, id: 'LIST' }],
    }),

    getMyCommunities: builder.query<Community[], void>({
      query: () => '/community/mine/',
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: [{ type: 'Community' as const, id: 'MINE' }],
    }),

    getCommunity: builder.query<Community, string>({
      query: (id) => `/community/${id}/`,
      providesTags: (_r, _e, id) => [{ type: 'Community' as const, id }],
    }),

    createCommunity: builder.mutation<Community, Partial<Community> | FormData>({
      query: (body) => ({
        url: '/community/',
        method: 'POST',
        body,
        ...(body instanceof FormData ? { formData: true as const } : {}),
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const enriched: Community = {
            ...data,
            is_member: true,
            is_admin: true,
          };
          const upsert = (draft: Community[]) => {
            const idx = draft.findIndex((c) => c.id === enriched.id);
            if (idx >= 0) draft[idx] = enriched;
            else draft.unshift(enriched);
          };
          dispatch(
            communityApiSlice.util.updateQueryData('getCommunities', undefined, upsert),
          );
          dispatch(
            communityApiSlice.util.updateQueryData('getMyCommunities', undefined, upsert),
          );
        } catch {
          /* create failed */
        }
      },
      invalidatesTags: [
        { type: 'Community' as const, id: 'LIST' },
        { type: 'Community' as const, id: 'MINE' },
      ],
    }),

    updateCommunity: builder.mutation<Community, { id: string; body: Partial<Community> | FormData }>({
      query: ({ id, body }) => ({
        url: `/community/${id}/`,
        method: 'PATCH',
        body,
        ...(body instanceof FormData ? { formData: true as const } : {}),
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Community' as const, id },
        { type: 'Community' as const, id: 'LIST' },
        { type: 'Community' as const, id: 'MINE' },
      ],
    }),

    joinCommunity: builder.mutation<void, string>({
      query: (id) => ({ url: `/community/${id}/join/`, method: 'POST' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Community' as const, id },
        { type: 'Community' as const, id: 'LIST' },
        { type: 'Community' as const, id: 'MINE' },
      ],
    }),

    leaveCommunity: builder.mutation<void, string>({
      query: (id) => ({ url: `/community/${id}/leave/`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Community' as const, id },
        { type: 'Community' as const, id: 'LIST' },
        { type: 'Community' as const, id: 'MINE' },
      ],
    }),

    getCommunityMembers: builder.query<any[], string>({
      query: (id) => `/community/${id}/members/`,
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: (_r, _e, id) => [{ type: 'CommunityMembers' as const, id }],
    }),

    // ── Admin: remove a member ─────────────────────────────────────────────
    removeCommunityMember: builder.mutation<void, { communityId: string; userId: string }>({
      query: ({ communityId, userId }) => ({
        url: `/community/${communityId}/members/${userId}/remove/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { communityId }) => [
        { type: 'CommunityMembers' as const, id: communityId },
        { type: 'Community' as const, id: communityId },
        { type: 'Community' as const, id: 'LIST' },
      ],
    }),

    // ── Admin: generate shareable invite link ──────────────────────────────
    generateInviteLink: builder.mutation<InviteLink, string>({
      query: (communityId) => ({
        url: `/community/${communityId}/invite/link/`,
        method: 'POST',
      }),
    }),

    // ── Admin: send invite emails ──────────────────────────────────────────
    inviteByEmail: builder.mutation<InviteEmailResult, { communityId: string; emails: string[] }>({
      query: ({ communityId, emails }) => ({
        url: `/community/${communityId}/invite/email/`,
        method: 'POST',
        body: { emails },
      }),
    }),

    // ── Public: accept invite token ────────────────────────────────────────
    acceptInvite: builder.mutation<{ detail: string; community_id: string }, string>({
      query: (token) => ({
        url: `/community/invite/${token}/accept/`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'Community' as const, id: 'LIST' },
        { type: 'Community' as const, id: 'MINE' },
      ],
    }),

    getCommunityMessages: builder.query<CommunityMessage[], string>({
      query: (id) => `/community/${id}/messages/`,
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: (_r, _e, id) => [{ type: 'CommunityMessages' as const, id }],
    }),

    sendCommunityMessage: builder.mutation<CommunityMessage, { id: string; body: FormData }>({
      query: ({ id, body }) => ({ url: `/community/${id}/messages/`, method: 'POST', body, formData: true }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'CommunityMessages' as const, id }],
    }),

    deleteCommunityMessage: builder.mutation<void, { communityId: string; messageId: string }>({
      query: ({ communityId, messageId }) => ({
        url: `/community/${communityId}/messages/${messageId}/delete/`,
        method: 'DELETE',
      }),
    }),

    toggleReaction: builder.mutation<{ reactions: Record<string, string[]> }, { communityId: string; messageId: string; emoji: string }>({
      query: ({ communityId, messageId, emoji }) => ({
        url: `/community/${communityId}/messages/${messageId}/react/`,
        method: 'POST',
        body: { emoji },
      }),
    }),

    getCommunityFeed: builder.query<Post[], void>({
      query: () => '/community/feed/',
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: [{ type: 'Post' as const, id: 'FEED' }],
    }),

    getCommunityPosts: builder.query<Post[], string>({
      query: (id) => `/community/${id}/posts/`,
      transformResponse: (raw: any) =>
        Array.isArray(raw) ? raw : (raw?.results ?? []),
      providesTags: (_r, _e, id) => [{ type: 'Post' as const, id }],
    }),

    shareListingToGroups: builder.mutation<
      { created: { community_id: string; post_id: string }[]; skipped: string[]; detail: string },
      { listing_id: string; community_ids: string[] }
    >({
      query: (body) => ({
        url: '/community/share-listing/',
        method: 'POST',
        body,
      }),
    }),

  }),
});

export const {
  useGetCommunitiesQuery,
  useGetMyCommunitiesQuery,
  useGetCommunityQuery,
  useCreateCommunityMutation,
  useUpdateCommunityMutation,
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
  useGetCommunityMembersQuery,
  useRemoveCommunityMemberMutation,
  useGenerateInviteLinkMutation,
  useInviteByEmailMutation,
  useAcceptInviteMutation,
  useGetCommunityMessagesQuery,
  useSendCommunityMessageMutation,
  useDeleteCommunityMessageMutation,
  useToggleReactionMutation,
  useGetCommunityFeedQuery,
  useGetCommunityPostsQuery,
  useShareListingToGroupsMutation,
} = communityApiSlice;