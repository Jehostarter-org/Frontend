import { apiSlice } from "./apiSlice";

const unwrapList = (response: any) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

export const communityApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCommunities: builder.query({
      query: () => "/community/",
      transformResponse: unwrapList,
      providesTags: [{ type: "Community", id: "LIST" }],
    }),

    getCommunityFeed: builder.query({
      query: () => "/community/feed/",
      transformResponse: unwrapList,
      providesTags: [{ type: "Community", id: "FEED" }],
    }),

    joinCommunity: builder.mutation({
      query: (id) => ({
        url: `/community/${id}/join/`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "Community", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCommunitiesQuery,
  useGetCommunityFeedQuery,
  useJoinCommunityMutation,
} = communityApiSlice;
