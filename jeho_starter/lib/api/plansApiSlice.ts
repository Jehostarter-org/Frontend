import { apiSlice } from "./apiSlice";

export const plansApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
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
  }),
});

export const {
  useGetApartmentPlansQuery,
  useSelectPackagePlanQuery,
  useSetupAirportPlanMutation,
  useUpgradeToGoldPlanMutation,
  useSubmitHousingSimDataMutation,
  useVerifyGoldPlanPaymentMutation,
  useCheckGoldEligibilityHomeMutation,
  useCheckGoldEligibilityDestinationMutation,
} = plansApiSlice;