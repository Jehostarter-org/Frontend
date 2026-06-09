import { apiSlice } from "@/lib/api/apiSlice";

export const shopApprovalApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // ── User: Create shop with approval docs ──────────────────────────────────
        createShopWithApproval: builder.mutation<any, FormData>({
            query: (formData) => ({
                url: "shops/create-with-approval/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["MyShop", "MyShopApprovalStatus"],
        }),

        // ── User: Get my shop's approval status ───────────────────────────────────
        getMyShopApprovalStatus: builder.query<
            { has_shop: false } | { has_shop: true; shop: ShopApprovalStatusPayload },
            void
        >({
            query: () => "shops/my/approval-status/",
            providesTags: ["MyShopApprovalStatus"],
        }),

        // ── User: Resubmit after changes requested ────────────────────────────────
        resubmitShopApproval: builder.mutation<any, Partial<ShopApprovalRequestPayload>>({
            query: (body) => ({
                url: "shops/my/resubmit/",
                method: "PATCH",
                body,
            }),
            invalidatesTags: ["MyShopApprovalStatus"],
        }),

        // ── User: Upload additional documents ────────────────────────────────────
        uploadShopDocument: builder.mutation<any, { shopId: string; formData: FormData }>({
            query: ({ shopId, formData }) => ({
                url: `shops/${shopId}/documents/`,
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["MyShopApprovalStatus"],
        }),

        // ── User: Delete a pending document ──────────────────────────────────────
        deleteShopDocument: builder.mutation<void, string>({
            query: (documentId) => ({
                url: `shops/documents/${documentId}/`,
                method: "DELETE",
            }),
            invalidatesTags: ["MyShopApprovalStatus"],
        }),

        // ── Admin: List pending approvals ─────────────────────────────────────────
        adminGetPendingShops: builder.query<AdminShopListItem[], void>({
            query: () => "shops/admin/shops/pending/",
            providesTags: ["AdminPendingShops"],
        }),

        // ── Admin: List all approvals ─────────────────────────────────────────────
        adminGetAllShopApprovals: builder.query<AdminShopListItem[], { status?: string } | void>({
            query: (params) => ({
                url: "shops/admin/shops/approvals/",
                params: params ?? {},
            }),
            providesTags: ["AdminPendingShops"],
        }),

        // ── Admin: Get detailed approval info for one shop ────────────────────────
        adminGetShopApprovalDetail: builder.query<AdminShopDetail, string>({
            query: (shopId) => `shops/admin/shops/${shopId}/approval-detail/`,
            providesTags: (_r, _e, id) => [{ type: "AdminShopDetail" as const, id }],
        }),

        // ── Admin: Approve / Reject / Request Changes ─────────────────────────────
        adminProcessShopApproval: builder.mutation<
            any,
            { shopId: string; action: "approve" | "reject" | "request_changes"; notes?: string; changes_requested?: string }
        >({
            query: ({ shopId, ...body }) => ({
                url: `shops/admin/shops/${shopId}/process-approval/`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["AdminPendingShops"],
        }),

        // ── Admin: Review a single document ──────────────────────────────────────
        adminReviewDocument: builder.mutation<
            any,
            { document_id: string; status: "approved" | "rejected"; rejection_reason?: string }
        >({
            query: (body) => ({
                url: "shops/admin/shops/documents/review/",
                method: "POST",
                body,
            }),
            invalidatesTags: ["AdminPendingShops"],
        }),

        // ── Admin: Stats ──────────────────────────────────────────────────────────
        adminGetShopStats: builder.query<AdminShopStats, void>({
            query: () => "shops/admin/shops/stats/",
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreateShopWithApprovalMutation,
    useGetMyShopApprovalStatusQuery,
    useResubmitShopApprovalMutation,
    useUploadShopDocumentMutation,
    useDeleteShopDocumentMutation,
    useAdminGetPendingShopsQuery,
    useAdminGetAllShopApprovalsQuery,
    useAdminGetShopApprovalDetailQuery,
    useAdminProcessShopApprovalMutation,
    useAdminReviewDocumentMutation,
    useAdminGetShopStatsQuery,
} = shopApprovalApi;

// ── Types ─────────────────────────────────────────────────────────────────────
interface ShopApprovalStatusPayload {
    id: string;
    name: string;
    is_active: boolean;
    created_at: string;
    documents_status: { total: number; pending: number; approved: number; rejected: number };
    approval_request: {
        id: string;
        status: "draft" | "pending" | "in_review" | "approved" | "rejected" | "changes_requested";
        admin_notes?: string;
        changes_requested_notes?: string;
        submitted_at?: string;
        reviewed_at?: string;
    };
}

interface ShopApprovalRequestPayload {
    business_name: string;
    registration_number?: string;
    tax_number?: string;
    business_address: string;
    business_phone: string;
    business_email: string;
    business_description?: string;
    years_in_business?: number;
    employee_count?: number;
}

interface AdminShopListItem {
    id: string;
    name: string;
    owner_name: string;
    owner_email: string;
    city: string;
    is_active: boolean;
    created_at: string;
    documents_count: number;
    approval_request?: {
        status: string;
        submitted_at?: string;
    };
}

interface AdminShopDetail {
    id: string;
    name: string;
    owner: { id: string; name: string; email: string; phone?: string; membership_plan: string };
    approval_request: ShopApprovalRequestPayload & {
        status: string;
        admin_notes?: string;
        changes_requested_notes?: string;
        submitted_at?: string;
        reviewed_at?: string;
    };
    documents: Array<{
        id: string;
        document_type: string;
        document_type_display: string;
        document_name: string;
        status: string;
        document_url: string;
        rejection_reason?: string;
    }>;
    is_active: boolean;
}

interface AdminShopStats {
    shops: { total: number; active: number; pending_approval: number; rejected: number; changes_requested: number };
    documents: { total: number; pending_review: number };
}