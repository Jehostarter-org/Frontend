"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ThumbsDown, ThumbsUp, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DashboardShell from "@/components/dashboard/dashboard-layout.tsx";
import { useCurrency } from "@/components/contexts/currencyContext";
import {
  unwrapList,
  useAdminGetOrdersQuery,
  useAdminProcessOrderMutation,
  type OrderItem,
} from "@/lib/api/ordersApiSlice";

const FILTERS = [
  { value: "pending", label: "Awaiting approval" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "", label: "All" },
];

function errorText(err: unknown, fallback: string): string {
  const data = (err as { data?: { detail?: string } | string })?.data;
  if (typeof data === "string") return data;
  return data?.detail || fallback;
}

export default function AdminOrdersPage() {
  const { formatPrice } = useCurrency();
  const [status, setStatus] = useState("pending");
  const { data, isLoading, isError, error } = useAdminGetOrdersQuery({ status: status || undefined });
  const [processOrder, { isLoading: processing }] = useAdminProcessOrderMutation();

  const [rejecting, setRejecting] = useState<OrderItem | null>(null);
  const [reason, setReason] = useState("");

  const orders = unwrapList(data);

  const approve = async (order: OrderItem) => {
    try {
      const res = await processOrder({ orderId: order.id, action: "approve" }).unwrap();
      toast.success(res.message || "Order approved and charged.");
    } catch (err) {
      toast.error(errorText(err, "Approval failed."));
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    try {
      await processOrder({ orderId: rejecting.id, action: "reject", reason }).unwrap();
      toast.success("Order rejected.");
      setRejecting(null);
      setReason("");
    } catch (err) {
      toast.error(errorText(err, "Could not reject the order."));
    }
  };

  return (
    <DashboardShell>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-1 text-2xl font-bold text-gray-900">Order approvals</h1>
          <p className="mb-6 text-sm text-gray-500">
            Approving an installment order charges the buyer&apos;s first installment and pays the
            seller, minus the 10% platform fee.
          </p>

          <div className="mb-6 flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                onClick={() => setStatus(f.value)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                  status === f.value
                    ? "border-teal-600 bg-teal-600 text-white"
                    : "border-gray-300 bg-white text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {isLoading && <Loader2 className="mx-auto mt-10 h-8 w-8 animate-spin text-teal-600" />}

          {isError && (
            <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {errorText(error, "Could not load orders. You need an admin account.")}
            </p>
          )}

          {!isLoading && !isError && orders.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-400">No orders in this view.</p>
          )}

          <div className="space-y-4">
            {orders.map((o) => (
              <Card key={o.id} className="space-y-3 rounded-2xl border-none p-5 shadow-md">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900">{o.listing_title}</p>
                    <p className="text-xs text-gray-500">
                      {o.shop_name} · {o.payment_type} · {new Date(o.created_at).toLocaleString()}
                    </p>
                    <p className="font-mono text-[11px] text-gray-400">{o.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black">
                      {formatPrice(parseFloat(o.total_price), o.currency)}
                    </p>
                    <p className="text-xs font-semibold capitalize text-gray-600">{o.status}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  {o.installments.length} installment(s):{" "}
                  {o.installments
                    .map((i) => `${formatPrice(parseFloat(i.amount), o.currency)} (${i.status})`)
                    .join(", ")}
                </p>

                {o.status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      disabled={processing}
                      onClick={() => approve(o)}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" /> Approve & charge
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processing}
                      onClick={() => setRejecting(o)}
                      className="border-red-300 text-red-600"
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                    </Button>
                  </div>
                )}
                {o.status === "approved" && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Charged
                  </p>
                )}
                {o.status === "rejected" && (
                  <p className="flex items-center gap-1 text-xs font-semibold text-red-600">
                    <XCircle className="h-4 w-4" /> {o.rejection_reason || "Rejected"}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={Boolean(rejecting)} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject this order?</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Reason shown to the buyer"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button onClick={reject} disabled={processing} className="bg-red-600 hover:bg-red-700">
              Reject order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
