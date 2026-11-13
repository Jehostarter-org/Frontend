import { apiSlice } from "./apiSlice";

export const plansApiSlice = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getMyMembership: builder.query<MembershipStatus | null, void>({
      query: () => "/memberships/my/",
      providesTags: ["Membership"],
    }),

    getApartmentPlans: builder.query({
      query: () => "/plans/apartment",
      providesTags: ["Plan"],
    }),

    submitHousingSimData: builder.mutation({
      query: (housingData) => ({
        url: "/plans/apartment",
        method: "POST",
        body: housingData
      }),
      invalidatesTags: ["Plan"]
    }),

    upgradeToGoldPlan: builder.mutation({
      query: (upgradeData) => ({
        url: "/plans/gold/upgrade",
        method: "POST",
        body: upgradeData
      }),
      invalidatesTags: ["Plan", "User"],
    }),

    setupAirportPlan: builder.mutation({
      query: (airportData) => ({
        url: "/plan/airport/setup",
        method: "POST",
        body: airportData
      }),
      invalidatesTags: ["Plan", "User"],
    }),

    checkGoldEligibilityDestination: builder.mutation({
      query: (paymentData) => ({
        url: "/plan/gold/eligibility/check/destination",
        method: "POST",
        body: paymentData
      }),
      invalidatesTags: ["Plan"],
    }),

    checkGoldEligibilityHome: builder.mutation({
      query: (paymentData) => ({
        url: "/plan/gold/eligibility/check/home",
        method: "POST",
        body: paymentData
      }),
      invalidatesTags: ["Plan"],
    }),

    getEligibilitySubmitted: builder.query<{ submitted: boolean }, void>({
      query: () => "/plan/gold/eligibility/exists",
    }),

    selectPackagePlan: builder.query({
      query: (planId) => `/plan/select/package/${planId}`,
      providesTags: ["Plan"],
    }),
    
    verifyGoldPlanPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/plan/verify/gold/plan/payment",
        method: "POST",
        body: paymentData
      }),
      invalidatesTags: ["Plan", "User"],
    }),

    // ── Admin: Gold-eligibility submission review ────────────────────────
    adminGetAllEligibility: builder.query<
      EligibilityAdminListItem[],
      { status?: string; pathway?: string } | void
    >({
      query: (params) => ({
        url: "/plan/admin/eligibility/",
        params: params ?? {},
      }),
      providesTags: ["AdminEligibility"],
    }),

    adminGetEligibilityDetail: builder.query<EligibilityAdminDetail, string>({
      query: (id) => `/plan/admin/eligibility/${id}/`,
      providesTags: (_r, _e, id) => [{ type: "AdminEligibilityDetail" as const, id }],
    }),

    adminProcessEligibility: builder.mutation<
      { message: string; status: "approved" | "rejected"; reason?: string },
      { eligibilityId: string; action: "approve" | "reject"; notes?: string }
    >({
      query: ({ eligibilityId, ...body }) => ({
        url: `/plan/admin/eligibility/${eligibilityId}/process/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminEligibility", "AdminEligibilityDetail"],
    }),

    adminGetEligibilityStats: builder.query<EligibilityAdminStats, void>({
      query: () => "/plan/admin/eligibility/stats/",
      providesTags: ["AdminEligibility"],
    }),
  }),
});

export const {
  useGetMyMembershipQuery,
  useGetApartmentPlansQuery,
  useSelectPackagePlanQuery,
  useSetupAirportPlanMutation,
  useUpgradeToGoldPlanMutation,
  useSubmitHousingSimDataMutation,
  useVerifyGoldPlanPaymentMutation,
  useCheckGoldEligibilityHomeMutation,
  useCheckGoldEligibilityDestinationMutation,
  useGetEligibilitySubmittedQuery,
  useAdminGetAllEligibilityQuery,
  useAdminGetEligibilityDetailQuery,
  useAdminProcessEligibilityMutation,
  useAdminGetEligibilityStatsQuery,
} = plansApiSlice;

export interface MembershipStatus {
  id: string;
  plan: "free" | "silver" | "gold";
  country_code: string;
  started_at: string;
  expires_at: string;
  is_active: boolean;
}

// ── Admin eligibility types ───────────────────────────────────────────────────

export interface EligibilityDocumentItem {
  id: string;
  document_type: string;
  document_type_display: string;
  file: string;
  uploaded_at: string;
}

export interface EligibilityAdminListItem {
  id: string;
  pathway: "a" | "b";
  status: string;
  user_email: string;
  user_name: string;
  phone: string;
  email: string;
  destination_country: string;
  destination_city: string;
  documents_count: number;
  rejection_reason: string;
  created_at: string;
  reviewed_at: string | null;
}

export interface EligibilityAdminDetail extends EligibilityAdminListItem {
  visa_expiry: string | null;
  passport_expiry: string | null;
  migration_doc_type: string;
  metadata: Record<string, unknown>;
  updated_at: string;
  documents: EligibilityDocumentItem[];
}

export interface EligibilityAdminStats {
  total: number;
  pending: number;
  processing: number;
  approved: number;
  conditionally_approved: number;
  rejected: number;
  by_pathway: {
    destination: number;
    home: number;
  };
}