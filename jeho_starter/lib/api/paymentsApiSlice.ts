import { apiSlice } from "./apiSlice";

export const paymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initializePayment: builder.mutation({
      query: (paymentData) => ({
        url: "/payments/initialize",
        method: "POST",
        body: paymentData,
      }),
    }),
    verifyPayment: builder.query({
      query: (reference) => `/payments/verify/${reference}`,
    }),
    paymentWebhook: builder.mutation({
      query: (webhookData) => ({
        url: "/payments/webhook",
        method: "POST",
        body: webhookData,
      }),
    }),
    // New endpoint integration
    verifyGoldPlanPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/plan/verify/gold/plan/payment",
        method: "POST",
        body: paymentData,
      }),
      invalidatesTags: ["Plan", "User"],
    }),
  }),
});

export const {
  useInitializePaymentMutation,
  useVerifyPaymentQuery,
  useLazyVerifyPaymentQuery,
  usePaymentWebhookMutation,
  // New hook for integrated endpoint
  useVerifyGoldPlanPaymentMutation,
} = paymentsApiSlice;
