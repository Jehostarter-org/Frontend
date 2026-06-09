"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    CheckCircle2, XCircle, AlertCircle, Clock, Eye,
    FileText, ChevronDown, ChevronUp, Search, Loader2,
    Building2, Mail, Phone, User, BarChart3, RefreshCw,
    ExternalLink, ThumbsUp, ThumbsDown, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    useAdminGetAllShopApprovalsQuery,
    useAdminGetShopApprovalDetailQuery,
    useAdminProcessShopApprovalMutation,
    useAdminReviewDocumentMutation,
    useAdminGetShopStatsQuery,
} from "@/lib/api/shopApprovalApiSlice";

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-700 border-gray-300", icon: <FileText className="w-3 h-3" /> },
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-300", icon: <Clock className="w-3 h-3" /> },
    in_review: { label: "In Review", color: "bg-blue-100 text-blue-700 border-blue-300", icon: <Eye className="w-3 h-3" /> },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300", icon: <XCircle className="w-3 h-3" /> },
    changes_requested: { label: "Changes Needed", color: "bg-orange-100 text-orange-700 border-orange-300", icon: <AlertCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["draft"];
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function DocStatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
        rejected: "bg-red-50 text-red-700 border-red-200",
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold border ${map[status] ?? map.pending}`}>
            {status}
        </span>
    );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
    const { data: stats, isLoading } = useAdminGetShopStatsQuery();
    if (isLoading || !stats) return null;

    const tiles = [
        { label: "Total Shops", value: stats.shops.total, color: "text-gray-800" },
        { label: "Active", value: stats.shops.active, color: "text-emerald-600" },
        { label: "Pending Review", value: stats.shops.pending_approval, color: "text-amber-600" },
        { label: "Changes Needed", value: stats.shops.changes_requested, color: "text-orange-600" },
        { label: "Rejected", value: stats.shops.rejected, color: "text-red-600" },
        { label: "Docs Pending", value: stats.documents.pending_review, color: "text-blue-600" },
    ];

    return (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
            {tiles.map((t) => (
                <Card key={t.label} className="p-3 text-center border-gray-200">
                    <p className={`text-2xl font-black ${t.color}`}>{t.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-tight">{t.label}</p>
                </Card>
            ))}
        </div>
    );
}

// ── Document Review Row ───────────────────────────────────────────────────────
function DocumentRow({ doc, onReviewed }: { doc: any; onReviewed: () => void }) {
    const [reviewDoc, { isLoading }] = useAdminReviewDocumentMutation();
    const [reason, setReason] = useState("");
    const [showReject, setShowReject] = useState(false);

    const handleApprove = async () => {
        try {
            await reviewDoc({ document_id: doc.id, status: "approved" }).unwrap();
            toast.success("Document approved");
            onReviewed();
        } catch { toast.error("Failed to approve document"); }
    };

    const handleReject = async () => {
        if (!reason.trim()) { toast.error("Please provide a rejection reason"); return; }
        try {
            await reviewDoc({ document_id: doc.id, status: "rejected", rejection_reason: reason }).unwrap();
            toast.success("Document rejected");
            setShowReject(false);
            onReviewed();
        } catch { toast.error("Failed to reject document"); }
    };

    return (
        <div className="flex flex-col gap-2 py-3 border-b border-gray-100 last:border-0">
            <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{doc.document_type_display}</p>
                    <p className="text-xs text-gray-500 truncate">{doc.document_name}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <DocStatusBadge status={doc.status} />
                    {doc.document_url && (
                        <a
                            href={doc.document_url} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    )}
                    {doc.status === "pending" && (
                        <>
                            <button
                                onClick={handleApprove} disabled={isLoading}
                                className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors disabled:opacity-50"
                            >
                                <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setShowReject(!showReject)}
                                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                            >
                                <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                        </>
                    )}
                </div>
            </div>
            {showReject && (
                <div className="flex gap-2 mt-1">
                    <Input
                        placeholder="Rejection reason (required)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-xs h-8"
                    />
                    <Button size="sm" onClick={handleReject} disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white h-8 text-xs shrink-0">
                        {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                    </Button>
                </div>
            )}
            {doc.rejection_reason && (
                <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">❌ {doc.rejection_reason}</p>
            )}
        </div>
    );
}

// ── Shop Detail Modal ─────────────────────────────────────────────────────────
function ShopDetailModal({ shopId, open, onClose }: { shopId: string; open: boolean; onClose: () => void }) {
    const { data: shop, isLoading, refetch } = useAdminGetShopApprovalDetailQuery(shopId, { skip: !open });
    const [processApproval, { isLoading: processing }] = useAdminProcessShopApprovalMutation();
    const [action, setAction] = useState<"approve" | "reject" | "request_changes" | null>(null);
    const [notes, setNotes] = useState("");
    const [changesNote, setChangesNote] = useState("");
    const [activeTab, setActiveTab] = useState<"details" | "documents">("details");

    const handleAction = async () => {
        if (!action) return;
        if (action === "reject" && !notes.trim()) { toast.error("Please provide a rejection reason"); return; }
        if (action === "request_changes" && !changesNote.trim()) { toast.error("Please describe the changes needed"); return; }
        try {
            await processApproval({
                shopId,
                action,
                notes: notes || undefined,
                changes_requested: changesNote || undefined,
            }).unwrap();
            toast.success(
                action === "approve" ? "Shop approved! 🎉" :
                    action === "reject" ? "Shop rejected." : "Changes requested."
            );
            onClose();
        } catch { toast.error("Action failed. Please try again."); }
    };

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <Building2 className="w-5 h-5 text-teal-700" />
                        {isLoading ? "Loading..." : shop?.name}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                    </div>
                )}

                {shop && (
                    <>
                        {/* Approval status */}
                        <div className="flex items-center justify-between">
                            <StatusBadge status={shop.approval_request?.status ?? "draft"} />
                            <span className="text-xs text-gray-400">
                                Submitted: {shop.approval_request?.submitted_at
                                    ? new Date(shop.approval_request.submitted_at).toLocaleDateString()
                                    : "—"}
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-2">
                            {(["details", "documents"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-white shadow text-teal-700" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {t} {t === "documents" && `(${shop.documents?.length ?? 0})`}
                                </button>
                            ))}
                        </div>

                        {/* Details tab */}
                        {activeTab === "details" && (
                            <div className="space-y-4 mt-2">
                                {/* Owner */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Owner</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { icon: <User className="w-3.5 h-3.5" />, value: shop.owner?.name },
                                            { icon: <Mail className="w-3.5 h-3.5" />, value: shop.owner?.email },
                                            { icon: <Phone className="w-3.5 h-3.5" />, value: shop.owner?.phone },
                                            { icon: null, label: "Plan", value: shop.owner?.membership_plan },
                                        ].map((row, i) => row.value && (
                                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                                                {row.icon && <span className="text-gray-400">{row.icon}</span>}
                                                {row.label && <span className="text-xs text-gray-400">{row.label}:</span>}
                                                <span className="truncate font-medium">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Business details */}
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Business</p>
                                    <div className="space-y-2">
                                        {[
                                            ["Business Name", shop.approval_request?.business_name],
                                            ["Reg. Number", shop.approval_request?.registration_number],
                                            ["Tax Number", shop.approval_request?.tax_number],
                                            ["Address", shop.approval_request?.business_address],
                                            ["Phone", shop.approval_request?.business_phone],
                                            ["Email", shop.approval_request?.business_email],
                                            ["Years in Biz", shop.approval_request?.years_in_business],
                                            ["Employees", shop.approval_request?.employee_count],
                                        ].filter(([, v]) => v).map(([label, value]) => (
                                            <div key={label as string} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                                                <span className="text-gray-500 shrink-0 mr-4">{label}</span>
                                                <span className="font-medium text-gray-800 text-right">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Admin notes if any */}
                                {shop.approval_request?.admin_notes && (
                                    <div className="bg-gray-50 rounded-xl p-3">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Previous Admin Notes</p>
                                        <p className="text-sm text-gray-700">{shop.approval_request.admin_notes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Documents tab */}
                        {activeTab === "documents" && (
                            <div className="mt-2">
                                {(!shop.documents || shop.documents.length === 0) ? (
                                    <p className="text-sm text-gray-500 text-center py-8">No documents uploaded.</p>
                                ) : (
                                    shop.documents.map((doc: any) => (
                                        <DocumentRow key={doc.id} doc={doc} onReviewed={refetch} />
                                    ))
                                )}
                            </div>
                        )}

                        {/* Action panel */}
                        {!["approved", "rejected"].includes(shop.approval_request?.status) && (
                            <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                                <p className="text-sm font-bold text-gray-700">Take Action</p>
                                <div className="flex gap-2">
                                    {(["approve", "request_changes", "reject"] as const).map((a) => {
                                        const cfg = {
                                            approve: { label: "Approve", cls: "bg-emerald-600 hover:bg-emerald-700 text-white" },
                                            reject: { label: "Reject", cls: "bg-red-600 hover:bg-red-700 text-white" },
                                            request_changes: { label: "Request Changes", cls: "bg-orange-500 hover:bg-orange-600 text-white" },
                                        }[a];
                                        return (
                                            <Button
                                                key={a} size="sm"
                                                onClick={() => setAction(action === a ? null : a)}
                                                className={`flex-1 text-xs font-semibold ${action === a ? cfg.cls : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                            >
                                                {cfg.label}
                                            </Button>
                                        );
                                    })}
                                </div>

                                {action === "approve" && (
                                    <div className="bg-emerald-50 rounded-xl p-3 space-y-2">
                                        <p className="text-xs text-emerald-800 font-semibold">Optional note for the shop owner:</p>
                                        <Textarea
                                            placeholder="e.g. Welcome aboard! Your shop is now live."
                                            className="text-xs min-h-[60px] resize-none"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                )}
                                {action === "reject" && (
                                    <div className="bg-red-50 rounded-xl p-3 space-y-2">
                                        <p className="text-xs text-red-800 font-semibold">Rejection reason (required):</p>
                                        <Textarea
                                            placeholder="Explain why the application is being rejected..."
                                            className="text-xs min-h-[80px] resize-none border-red-200"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>
                                )}
                                {action === "request_changes" && (
                                    <div className="bg-orange-50 rounded-xl p-3 space-y-2">
                                        <p className="text-xs text-orange-800 font-semibold">Describe what changes are needed (required):</p>
                                        <Textarea
                                            placeholder="e.g. Please upload a clearer copy of your business registration certificate."
                                            className="text-xs min-h-[80px] resize-none border-orange-200"
                                            value={changesNote}
                                            onChange={(e) => setChangesNote(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                <DialogFooter className="gap-2 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={processing}>Cancel</Button>
                    {action && (
                        <Button
                            onClick={handleAction} disabled={processing}
                            className={
                                action === "approve" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                    action === "reject" ? "bg-red-600 hover:bg-red-700 text-white" :
                                        "bg-orange-500 hover:bg-orange-600 text-white"
                            }
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                action === "approve" ? "✓ Confirm Approval" :
                                    action === "reject" ? "✗ Confirm Rejection" :
                                        "→ Send Change Request"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Shop Row ──────────────────────────────────────────────────────────────────
function ShopRow({ shop }: { shop: any }) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">{shop.name}</p>
                    <p className="text-xs text-gray-400">{shop.city}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                    <p className="text-sm text-gray-700">{shop.owner_name}</p>
                    <p className="text-xs text-gray-400">{shop.owner_email}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                    <StatusBadge status={shop.approval_request?.status ?? "draft"} />
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-sm text-gray-500">
                    {shop.documents_count} doc{shop.documents_count !== 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                    {new Date(shop.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                    <Button
                        size="sm" variant="outline"
                        onClick={() => setModalOpen(true)}
                        className="text-xs gap-1 h-7 border-teal-200 text-teal-700 hover:bg-teal-50"
                    >
                        <Eye className="w-3 h-3" /> Review
                    </Button>
                </td>
            </tr>
            {modalOpen && (
                <ShopDetailModal shopId={shop.id} open={modalOpen} onClose={() => setModalOpen(false)} />
            )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminShopApprovals() {
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");

    const { data: shops, isLoading, refetch } = useAdminGetAllShopApprovalsQuery(
        statusFilter ? { status: statusFilter } : undefined
    );

    const filtered = (shops ?? []).filter((s) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.owner_email.toLowerCase().includes(q) || s.owner_name.toLowerCase().includes(q);
    });

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-teal-700" /> Shop Approvals
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Review, approve, or reject shop applications</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <StatsBar />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, owner, email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Statuses</SelectItem>
                        {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                            <SelectItem key={val} value={val}>{cfg.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card className="border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">No shops found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {["Shop", "Owner", "Status", "Docs", "Submitted", ""].map((h) => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${h === "Owner" ? "hidden md:table-cell" :
                                                h === "Status" ? "hidden sm:table-cell" :
                                                    ["Docs", "Submitted"].includes(h) ? "hidden lg:table-cell" : ""
                                            }`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((shop) => <ShopRow key={shop.id} shop={shop} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <p className="text-xs text-gray-400 text-right mt-3">
                {filtered.length} shop{filtered.length !== 1 ? "s" : ""} shown
            </p>
        </div>
    );
}