import { apiSlice } from "@/lib/api/apiSlice";

export const userProfileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── Get current user profile ──────────────────────────────────────────────
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "users/me/",
      providesTags: ["User"],
    }),

    // ── Update user profile ───────────────────────────────────────────────────
    updateUserProfile: builder.mutation<UserProfile, Partial<UserProfile>>({
      query: (body) => ({
        url: "users/me/",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = userProfileApi;

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  avatar?: string;
  phone_number?: string;
  bio?: string;
  city?: string;
  state_province?: string;
  current_country?: string;
  destination_country?: string;
  migration_status?: string;
  membership_plan?: string;
  is_verified?: boolean;
  location?: { type: string; coordinates: [number, number] } | null;
}