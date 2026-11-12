"use client";

import { useState } from "react";
import { Loader2, PackageOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import DashboardShell from "@/components/dashboard/dashboard-layout.tsx";
import { useCurrency } from "@/components/contexts/currencyContext";
import {
  unwrapList,
  useGetMyOrdersQuery,
  useGetShopOrdersQuery,
  type OrderItem,
} from "@/lib/api/ordersApiSlice";

const ORDER_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "Awaiting approval", color: "bg-amber-100 text-amber-700 border-amber-300" },
  approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300" },
  in_fulfillment: { label: "In fulfillment", color: "bg-blue-100 text-blue-700 border-blue-300" },
  completed: { label: "Completed", color: "bg-emerald-100 text-emerald-700 border-emerald-300" },
  cancelled: { label: "Cancelled", color: "bg-gray-100 text-gray-600 border-gray-300" },
};

const INSTALLMENT_COLOR: Record<string, string> = {
  pending: "text-amber-600",
  authorized: "text-blue-600",
  paid: "text-emerald-600",
  failed: "text-red-600",
  refunded: "text-gray-500",
};

function OrderCard({ order, seller }: { order: OrderItem; seller: boolean }) {
  const { formatPrice } = useCurrency();
  const cfg = ORDER_STATUS[order.status] ?? ORDER_STATUS.pending;
  const paid = order.installments.filter((i) => i.status === "paid").length;

  return (
    <Card className="space-y-4 rounded-2xl border-none p-5 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-gray-900">{order.listing_title}</p>
          <p className="text-xs text-gray-500">
            {seller ? "Your shop" : order.shop_name} ·{" "}
            {new Date(order.created_at).toLocaleDateString()} ·{" "}
            {order.payment_type === "full" ? "Paid in full" : "Installments"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-gray-900">
            {formatPrice(parseFloat(order.total_price), order.currency)}
          </p>
          <span
            className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      {order.status === "rejected" && order.rejection_reason && (
        <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
          Reason: {order.rejection_reason}
        </p>
      )}

      {order.payment_type === "installment" && order.installments.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-400">
            Installments ({paid}/{order.installments.length} paid)
          </p>
          <div className="divide-y rounded-xl border">
            {order.installments.map((i) => (
              <div key={i.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-gray-700">
                  #{i.installment_number}
                  {i.due_date && (
                    <span className="ml-2 text-xs text-gray-400">
                      due {new Date(i.due_date).toLocaleDateString()}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold">
                    {formatPrice(parseFloat(i.amount), order.currency)}
                  </span>
                  <span className={`text-xs font-bold ${INSTALLMENT_COLOR[i.status] ?? ""}`}>
                    {i.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function OrderList({ seller }: { seller: boolean }) {
  const mine = useGetMyOrdersQuery(undefined, { skip: seller });
  const shop = useGetShopOrdersQuery(undefined, { skip: !seller });
  const q = seller ? shop : mine;
  const orders = unwrapList(q.data);

  if (q.isLoading) {
    return <Loader2 className="mx-auto mt-10 h-8 w-8 animate-spin text-teal-600" />;
  }
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-gray-400">
        <PackageOpen className="h-10 w-10" />
        <p className="text-sm">{seller ? "No orders on your shop yet." : "You have no orders yet."}</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} seller={seller} />
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [tab, setTab] = useState<"purchases" | "sales">("purchases");

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-2xl font-bold text-gray-900">Orders</h1>

          <div className="mb-6 inline-flex rounded-xl bg-gray-200 p-1 text-sm font-semibold">
            {(
              [
                ["purchases", "My purchases"],
                ["sales", "Orders on my shop"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-lg px-4 py-2 transition ${
                  tab === key ? "bg-white text-teal-700 shadow" : "text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <OrderList seller={tab === "sales"} />
        </div>
      </div>
    </DashboardShell>
  );
}
