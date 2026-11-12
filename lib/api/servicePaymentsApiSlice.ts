import { apiSlice } from "./apiSlice";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConnectStatus {
  connected: boolean;
  account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  onboarding_completed: boolean;
}

export interface ConnectOnboardingResponse {
  account_id: string;
  onboarding_url: string;
  expires_at?: number;
}

export interface AuthorizeHoldPayload {
  serviceId: string;
  payment_method_id: string;
  amount?: number;
  currency?: string;
}

export interface AuthorizeHoldResponse {
  service_id?: string;
  payment_id: string;
  client_secret?: string | null;
  payment_status?: string;
  status?: string;
  amount: number;
  currency: string;
  hold?: { status?: string; client_secret?: string | null } & Record<string, unknown>;
  message?: string;
}

export interface ServiceRequestSummary {
  id: string;
  service_type: string;
  status: string;
  price: string | null;
  currency: string;
  payment_status?: string;
}

const redirectUrls = () => {
  const here = typeof window !== "undefined" ? window.location.origin : "";
  return {
    return_url: `${here}/dashboard/payouts?connect=return`,
    refresh_url: `${here}/dashboard/payouts?connect=refresh`,
  };
};

export const servicePaymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── Seller (shop) payouts ────────────────────────────────────────────────
    getShopConnectStatus: builder.query<ConnectStatus, void>({
      query: () => "/shops/stripe-connect/status/",
      providesTags: ["ConnectAccount"],
    }),
    startShopConnect: builder.mutation<ConnectOnboardingResponse, void>({
      query: () => ({ url: "/shops/stripe-connect/", method: "POST", body: redirectUrls() }),
      invalidatesTags: ["ConnectAccount"],
    }),

    // ── Driver / chaperone payouts ───────────────────────────────────────────
    getProviderConnectStatus: builder.query<ConnectStatus, void>({
      query: () => "/services/provider-profiles/stripe-connect/status/",
      providesTags: ["ConnectAccount"],
    }),
    startProviderConnect: builder.mutation<ConnectOnboardingResponse, void>({
      query: () => ({
        url: "/services/provider-profiles/stripe-connect/",
        method: "POST",
        body: redirectUrls(),
      }),
      invalidatesTags: ["ConnectAccount"],
    }),

    // ── Rider / customer: hold the fare, release on cancel ──────────────────
    getServiceRequestSummary: builder.query<ServiceRequestSummary, string>({
      query: (id) => `/services/${id}/`,
      providesTags: (_r, _e, id) => [{ type: "Service" as const, id }],
    }),
    authorizeServiceHold: builder.mutation<AuthorizeHoldResponse, AuthorizeHoldPayload>({
      query: ({ serviceId, ...body }) => ({
        url: `/services/${serviceId}/authorize-hold/`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_r, _e, { serviceId }) => [{ type: "Service" as const, id: serviceId }],
    }),
    cancelServiceRequest: builder.mutation<
      { service_id: string; status: string; payment_status?: string; message?: string },
      { serviceId: string; reason?: string }
    >({
      query: ({ serviceId, reason }) => ({
        url: `/services/${serviceId}/cancel/`,
        method: "POST",
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { serviceId }) => [{ type: "Service" as const, id: serviceId }],
    }),
  }),
});

export const {
  useGetShopConnectStatusQuery,
  useStartShopConnectMutation,
  useGetProviderConnectStatusQuery,
  useStartProviderConnectMutation,
  useGetServiceRequestSummaryQuery,
  useAuthorizeServiceHoldMutation,
  useCancelServiceRequestMutation,
} = servicePaymentsApiSlice;
