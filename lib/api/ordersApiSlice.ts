import { apiSlice } from "./apiSlice";

// ── Types (mirror shops/serializers.py → OrderSerializer) ─────────────────────

export interface InstallmentItem {
  id: string;
  installment_number: number;
  amount: string;
  platform_fee_amount: string;
  seller_amount: string;
  due_date: string | null;
  status: "pending" | "authorized" | "paid" | "failed" | "refunded";
  payment_id: string;
  paid_at: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  buyer: string;
  shop: string;
  shop_name: string;
  listing: string;
  listing_title: string;
  total_price: string;
  currency: string;
  payment_type: "full" | "installment";
  status: "pending" | "approved" | "rejected" | "in_fulfillment" | "completed" | "cancelled";
  rejection_reason: string;
  installments: InstallmentItem[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderPayload {
  listing_id: string;
  payment_type: "full" | "installment";
  installments_count?: number;
  interval?: "weekly" | "monthly";
}

export interface CreateOrderResponse {
  order: OrderItem;
  client_secret: string | null;
  customer_id: string;
}

export interface AttachPaymentMethodResponse {
  order_id: string;
  status: string;
  message: string;
  charged_amount?: number;
  payment_id?: string;
}

type Paginated<T> = T[] | { results: T[] };

/** The API may return a bare array or a DRF page ({ results: [...] }). */
export const unwrapList = <T,>(data: Paginated<T> | undefined): T[] =>
  Array.isArray(data) ? data : data?.results ?? [];

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderPayload>({
      query: (body) => ({ url: "/shops/orders/", method: "POST", body }),
      invalidatesTags: ["Order"],
    }),

    attachOrderPaymentMethod: builder.mutation<
      AttachPaymentMethodResponse,
      { orderId: string; payment_method_id: string; customer_id?: string }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/shops/orders/${orderId}/payment-method/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "AdminOrder"],
    }),

    getMyOrders: builder.query<Paginated<OrderItem>, void>({
      query: () => "/shops/orders/my/",
      providesTags: ["Order"],
    }),

    getShopOrders: builder.query<Paginated<OrderItem>, void>({
      query: () => "/shops/orders/shop/",
      providesTags: ["Order"],
    }),

    adminGetOrders: builder.query<Paginated<OrderItem>, { status?: string } | void>({
      query: (params) => ({ url: "/shops/admin/orders/", params: params ?? {} }),
      providesTags: ["AdminOrder"],
    }),

    adminProcessOrder: builder.mutation<
      { order_id: string; status: string; message: string },
      { orderId: string; action: "approve" | "reject"; reason?: string }
    >({
      query: ({ orderId, ...body }) => ({
        url: `/shops/admin/orders/${orderId}/process-approval/`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["AdminOrder", "Order"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useAttachOrderPaymentMethodMutation,
  useGetMyOrdersQuery,
  useGetShopOrdersQuery,
  useAdminGetOrdersQuery,
  useAdminProcessOrderMutation,
} = ordersApiSlice;
