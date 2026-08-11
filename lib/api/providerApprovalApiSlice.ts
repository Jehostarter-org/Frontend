import { apiSlice } from "@/lib/api/apiSlice";

export const providerApprovalApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ── Admin: List pending provider profiles ──────────────────────────────
        adminGetProviderPending: builder.query<ProviderListItem[], void>({
            query: () => "services/admin/providers/pending/",
            providesTags: ["AdminProviders"],
        }),

        // ── Admin: List all provider profiles with filters ─────────────────────
        adminGetAllProviderApprovals: builder.query<
            ProviderListItem[],
            { status?: string; service_type?: string; search?: string } | void
        >({
            query: (params) => ({
                url: "services/admin/providers/approvals/",
                params: params ?? {},
            }),
            providesTags: ["AdminProviders"],
        }),

        // ── Admin: Detailed provider profile + eligibility check ───────────────
        adminGetProviderApprovalDetail: builder.query<ProviderDetail, string>({
            query: (id) => `services/admin/providers/${id}/approval-detail/`,
            providesTags: (_r, _e, id) => [{ type: "AdminProviderDetail" as const, id }],
        }),

        // ── Admin: Approve / Reject a provider profile ─────────────────────────
        adminProcessProviderApproval: builder.mutation<
            { message: string; status: "approved" | "rejected"; reason?: string },
            { providerId: string; action: "approve" | "reject"; notes?: string }
        >({
            query: ({ providerId, ...body }) => ({
                url: `services/admin/providers/${providerId}/process-approval/`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["AdminProviders"],
        }),

        // ── Admin: Approval statistics ─────────────────────────────────────────
        adminGetProviderStats: builder.query<ProviderStats, void>({
            query: () => "services/admin/providers/stats/",
        }),
    }),
    overrideExisting: false,
});

export const {
    useAdminGetProviderPendingQuery,
    useAdminGetAllProviderApprovalsQuery,
    useAdminGetProviderApprovalDetailQuery,
    useAdminProcessProviderApprovalMutation,
    useAdminGetProviderStatsQuery,
} = providerApprovalApi;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EligibilityCheck {
    key: string;
    label: string;
    passed: boolean;
    detail: string;
}

export interface EligibilityResult {
    eligible: boolean;
    passed: number;
    total: number;
    checks: EligibilityCheck[];
}

export interface ProviderDocument {
    key: string;
    label: string;
    url: string | null;
}

export interface ProviderListItem {
    id: string;
    user: string;
    user_email: string;
    full_name: string;
    service_type: string;
    country_code: string;
    city: string;
    is_active: boolean;
    approval_status: "pending" | "approved" | "rejected";
    rejection_reason?: string;
    registered_at: string;
    first_name?: string;
    last_name?: string;
}

export interface ProviderDetail extends ProviderListItem {
    bio?: string;
    emergency_contact?: string;
    national_identity_number?: string;
    license_number?: string;
    license_state_country?: string;
    license_expiration_date?: string | null;
    vehicle_model?: string;
    vehicle_year?: string;
    vehicle_colour?: string;
    license_plate_number?: string;
    vin?: string;
    sim_card_reference?: string;
    tax_file_number_reference?: string;
    offers_translation_service?: boolean;
    offers_registration_service?: boolean;
    reviewed_at?: string | null;
    eligibility: EligibilityResult;
    documents: ProviderDocument[];
}

export interface ProviderStats {
    providers: {
        total: number;
        pending_approval: number;
        approved: number;
        rejected: number;
    };
    by_service_type: {
        drivers: number;
        chaperones: number;
        pending_drivers: number;
        pending_chaperones: number;
    };
}
