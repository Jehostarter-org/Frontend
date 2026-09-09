"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    CheckCircle2, XCircle, Clock, Eye, Search, Loader2,
    Mail, MapPin, User, BarChart3, RefreshCw, ExternalLink,
    FileCheck2, FileX2, ShieldCheck, ShieldAlert,
    CalendarDays, Phone, Info, FileText, Plane, Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    useAdminGetAllEligibilityQuery,
    useAdminGetEligibilityDetailQuery,
    useAdminProcessEligibilityMutation,
    useAdminGetEligibilityStatsQuery,
} from "@/lib/api/plansApiSlice";
import type { EligibilityAdminDetail, EligibilityAdminListItem } from "@/lib/api/plansApiSlice";

// ── Config ────────────────────────────────────────────────────────────────────

const PATHWAY_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    a: { label: "Destination", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Plane className="w-3 h-3" /> },
    b: { label: "Home Country", color: "bg-purple-50 text-purple-700 border-purple-200", icon: <Home className="w-3 h-3" /> },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-gray-100 text-gray-700 border-gray-200", icon: <Clock className="w-3 h-3" /> },
    processing: { label: "Processing", color: "bg-amber-100 text-amber-700 border-amber-300", icon: <Loader2 className="w-3 h-3" /> },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
    conditionally_approved: { label: "Conditionally Approved", color: "bg-blue-100 text-blue-700 border-blue-300", icon: <Clock className="w-3 h-3" /> },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300", icon: <XCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function PathwayBadge({ pathway }: { pathway: string }) {
    const cfg = PATHWAY_CONFIG[pathway] ?? { label: pathway, color: "bg-gray-100 text-gray-700 border-gray-200", icon: null };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar() {
    const { data: stats, isLoading } = useAdminGetEligibilityStatsQuery();
    if (isLoading || !stats) return null;

    const tiles = [
        { label: "Total Submissions", value: stats.total, color: "text-gray-800" },
        { label: "Pending", value: stats.pending, color: "text-amber-600" },
        { label: "Processing", value: stats.processing, color: "text-orange-600" },
        { label: "Approved", value: stats.approved, color: "text-emerald-600" },
        { label: "Conditional", value: stats.conditionally_approved, color: "text-blue-600" },
        { label: "Rejected", value: stats.rejected, color: "text-red-600" },
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

// ── Documents Panel ───────────────────────────────────────────────────────────

function DocumentsPanel({ documents }: { documents: EligibilityAdminDetail["documents"] }) {
    if (!documents || documents.length === 0) {
        return (
            <div className="text-center py-10">
                <FileText className="w-10 h-10 mx-auto mb-3 opacity-30 text-gray-300" />
                <p className="text-sm text-gray-500">No documents uploaded.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {documents.map((doc) => (
                <a
                    key={doc.id}
                    href={doc.file}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative block aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={doc.file} alt={doc.document_type_display} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="flex items-center gap-1 text-xs font-bold text-white">
                            <ExternalLink className="w-3 h-3" /> View
                        </span>
                    </span>
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 truncate">
                        {doc.document_type_display}
                    </span>
                </a>
            ))}
        </div>
    );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────

function EligibilityDetailModal({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
    const { data: item, isLoading } = useAdminGetEligibilityDetailQuery(id, { skip: !open });
    const [processEligibility, { isLoading: processing }] = useAdminProcessEligibilityMutation();
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [notes, setNotes] = useState("");
    const [activeTab, setActiveTab] = useState<"details" | "documents">("details");

    const handleAction = async () => {
        if (!action || !item) return;
        if (action === "reject" && !notes.trim()) { toast.error("Please provide a rejection reason"); return; }
        try {
            await processEligibility({
                eligibilityId: item.id,
                action,
                notes: notes || undefined,
            }).unwrap();
            toast.success(action === "approve" ? "Submission approved!" : "Submission rejected.");
            onClose();
        } catch { toast.error("Action failed. Please try again."); }
    };

    const showActions = item && !["approved", "rejected"].includes(item.status);

    const detailRows = item ? [
        ["Full Name", item.user_name],
        ["Email", item.user_email || item.email],
        ["Phone", item.phone],
        ["Destination", item.destination_city ? `${item.destination_city}, ${item.destination_country?.toUpperCase()}` : item.destination_country?.toUpperCase()],
        ["Submitted", new Date(item.created_at).toLocaleDateString()],
        ...(item.visa_expiry ? [["Visa Expiry", new Date(item.visa_expiry).toLocaleDateString()] as [string, string]] : []),
        ...(item.passport_expiry ? [["Passport Expiry", new Date(item.passport_expiry).toLocaleDateString()] as [string, string]] : []),
        ...(item.reviewed_at ? [["Reviewed", new Date(item.reviewed_at).toLocaleString()] as [string, string]] : []),
    ].filter((row) => row[1] != null && row[1] !== "") as [string, string][] : [];

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <User className="w-5 h-5 text-teal-700" />
                        {isLoading ? "Loading..." : item?.user_name || item?.user_email}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                    </div>
                )}

                {item && (
                    <>
                        {/* Status + pathway */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <PathwayBadge pathway={item.pathway} />
                                <StatusBadge status={item.status} />
                            </div>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <FileText className="w-3 h-3" /> {item.documents?.length ?? 0} documents
                            </span>
                        </div>

                        {item.status === "rejected" && item.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Rejection reason</p>
                                <p className="text-sm text-red-700">{item.rejection_reason}</p>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-2">
                            {(["details", "documents"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-white shadow text-teal-700" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {t} {t === "documents" && `(${item.documents?.length ?? 0})`}
                                </button>
                            ))}
                        </div>

                        {/* Details tab */}
                        {activeTab === "details" && (
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span className="truncate font-medium">{item.user_email || item.email}</span>
                                </div>
                                {detailRows.map(([label, value]) => label !== "Email" && (
                                    <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                                        <span className="text-gray-500 shrink-0 mr-4">{label}</span>
                                        <span className="font-medium text-gray-800 text-right">{String(value)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Documents tab */}
                        {activeTab === "documents" && (
                            <div className="mt-2">
                                <DocumentsPanel documents={item.documents} />
                            </div>
                        )}

                        {/* Action panel */}
                        {showActions && (
                            <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                                <p className="text-sm font-bold text-gray-700">Take Action</p>
                                <div className="flex gap-2">
                                    {(["approve", "reject"] as const).map((a) => {
                                        const cfg = a === "approve"
                                            ? { label: "Approve", cls: "bg-emerald-600 hover:bg-emerald-700 text-white" }
                                            : { label: "Reject", cls: "bg-red-600 hover:bg-red-700 text-white" };
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
                                        <p className="text-xs text-emerald-800 font-semibold">Optional note for the applicant:</p>
                                        <Textarea
                                            placeholder="e.g. Welcome to Gold membership! Your eligibility is confirmed."
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
                                <div className="flex gap-2 justify-end">
                                    <Button variant="outline" onClick={onClose} disabled={processing} size="sm">Cancel</Button>
                                    {action && (
                                        <Button
                                            onClick={handleAction} disabled={processing} size="sm"
                                            className={action === "approve"
                                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                : "bg-red-600 hover:bg-red-700 text-white"}
                                        >
                                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                                action === "approve" ? <><FileCheck2 className="w-4 h-4 mr-1" /> Confirm Approval</> : <><FileX2 className="w-4 h-4 mr-1" /> Confirm Rejection</>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ── Row ───────────────────────────────────────────────────────────────────────

function EligibilityRow({ item }: { item: EligibilityAdminListItem }) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                            {(item.user_name || item.user_email || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.user_name || item.user_email}</p>
                            <p className="text-xs text-gray-400 truncate">{item.user_email}</p>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                    <PathwayBadge pathway={item.pathway} />
                </td>
                <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                    {item.destination_city ? `${item.destination_city}, ${item.destination_country?.toUpperCase()}` : item.destination_country?.toUpperCase() || "—"}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                    </span>
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
                <EligibilityDetailModal id={item.id} open={modalOpen} onClose={() => setModalOpen(false)} />
            )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminEligibilityReview() {
    const [statusFilter, setStatusFilter] = useState("");
    const [pathwayFilter, setPathwayFilter] = useState("");
    const [search, setSearch] = useState("");

    const { data: items, isLoading, refetch } = useAdminGetAllEligibilityQuery({
        status: statusFilter || undefined,
        pathway: pathwayFilter || undefined,
    });

    const filtered = (items ?? []).filter((item) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (item.user_name ?? "").toLowerCase().includes(q)
            || (item.user_email ?? "").toLowerCase().includes(q)
            || (item.destination_city ?? "").toLowerCase().includes(q)
            || (item.destination_country ?? "").toLowerCase().includes(q);
    });

    const pathwayTabs = [
        { value: "", label: "All Pathways", icon: null },
        { value: "a", label: "Destination", icon: <Plane className="w-3 h-3" /> },
        { value: "b", label: "Home Country", icon: <Home className="w-3 h-3" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-teal-700" /> Eligibility Checks
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Review, approve, or reject Gold membership eligibility submissions</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <StatsBar />

            {/* Pathway tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {pathwayTabs.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setPathwayFilter(t.value)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${pathwayFilter === t.value
                            ? "bg-teal-700 text-white border-teal-700"
                            : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"
                            }`}
                    >
                        {t.icon} {t.label}
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or destination..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
                    {Object.entries({ "": "All", pending: "Pending", processing: "Processing", approved: "Approved", conditionally_approved: "Conditional", rejected: "Rejected" }).map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => setStatusFilter(val)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${statusFilter === val ? "bg-white shadow text-teal-700" : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <Card className="border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">No eligibility submissions found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {["Applicant", "Pathway", "Status", "Destination", "Submitted", ""].map((h) => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${h === "Pathway" ? "hidden sm:table-cell" :
                                                h === "Destination" ? "hidden md:table-cell" :
                                                    h === "Submitted" ? "hidden lg:table-cell" : ""
                                            }`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item) => <EligibilityRow key={item.id} item={item} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <p className="text-xs text-gray-400 text-right mt-3">
                {filtered.length} submission{filtered.length !== 1 ? "s" : ""} shown
            </p>
        </div>
    );
}
