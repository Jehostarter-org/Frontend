"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
    CheckCircle2, XCircle, Clock, Eye, Search, Loader2,
    Mail, MapPin, User, BarChart3, RefreshCw, ExternalLink,
    Car, Users, FileCheck2, FileX2, ShieldCheck, ShieldAlert,
    CalendarDays, Phone, CreditCard, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
    useAdminGetAllProviderApprovalsQuery,
    useAdminGetProviderApprovalDetailQuery,
    useAdminProcessProviderApprovalMutation,
    useAdminGetProviderStatsQuery,
} from "@/lib/api/providerApprovalApiSlice";
import type { EligibilityResult, ProviderDetail, ProviderListItem } from "@/lib/api/providerApprovalApiSlice";

// ── Config ────────────────────────────────────────────────────────────────────
export const SERVICE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    airport_pickup: { label: "Driver", color: "bg-blue-50 text-blue-700 border-blue-200", icon: <Car className="w-3 h-3" /> },
    chaperone: { label: "Chaperone", color: "bg-purple-50 text-purple-700 border-purple-200", icon: <Users className="w-3 h-3" /> },
};

export const PROVIDER_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pending", color: "bg-amber-100 text-amber-700 border-amber-300", icon: <Clock className="w-3 h-3" /> },
    approved: { label: "Approved", color: "bg-emerald-100 text-emerald-700 border-emerald-300", icon: <CheckCircle2 className="w-3 h-3" /> },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-700 border-red-300", icon: <XCircle className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = PROVIDER_STATUS_CONFIG[status] ?? PROVIDER_STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

function TypeBadge({ type }: { type: string }) {
    const cfg = SERVICE_TYPE_CONFIG[type] ?? { label: type, color: "bg-gray-100 text-gray-700 border-gray-200", icon: null };
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.color}`}>
            {cfg.icon} {cfg.label}
        </span>
    );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
    const { data: stats, isLoading } = useAdminGetProviderStatsQuery();
    if (isLoading || !stats) return null;

    const tiles = [
        { label: "Total Providers", value: stats.providers.total, color: "text-gray-800" },
        { label: "Approved", value: stats.providers.approved, color: "text-emerald-600" },
        { label: "Pending Review", value: stats.providers.pending_approval, color: "text-amber-600" },
        { label: "Rejected", value: stats.providers.rejected, color: "text-red-600" },
        { label: "Pending Drivers", value: stats.by_service_type.pending_drivers, color: "text-blue-600" },
        { label: "Pending Chaperones", value: stats.by_service_type.pending_chaperones, color: "text-purple-600" },
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

// ── Eligibility Panel ─────────────────────────────────────────────────────────
function EligibilityPanel({ eligibility }: { eligibility: EligibilityResult }) {
    const allPassed = eligibility.eligible;
    return (
        <div className="space-y-3">
            <div className={`rounded-xl p-3 flex items-center gap-3 border ${allPassed ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
                {allPassed
                    ? <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                    : <ShieldAlert className="w-8 h-8 text-red-600 shrink-0" />}
                <div className="flex-1">
                    <p className={`text-sm font-bold ${allPassed ? "text-emerald-800" : "text-red-800"}`}>
                        {allPassed ? "Meets all eligibility criteria" : "Does not meet all criteria"}
                    </p>
                    <p className="text-xs text-gray-500">
                        {eligibility.passed} of {eligibility.total} requirements met
                    </p>
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden shrink-0">
                    <div
                        className={`h-full rounded-full ${allPassed ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{ width: `${eligibility.total ? Math.round((eligibility.passed / eligibility.total) * 100) : 0}%` }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {eligibility.checks.map((c) => (
                    <div key={c.key} className={`flex items-start gap-2 rounded-lg px-3 py-2 border text-sm ${c.passed ? "bg-gray-50 border-gray-200" : "bg-red-50/60 border-red-200"}`}>
                        {c.passed
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            : <XCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />}
                        <div className="min-w-0">
                            <p className={`font-medium ${c.passed ? "text-gray-700" : "text-red-700"}`}>{c.label}</p>
                            {c.detail && <p className="text-xs text-gray-500 truncate">{c.detail}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Documents Panel ───────────────────────────────────────────────────────────
function DocumentsPanel({ documents }: { documents: ProviderDetail["documents"] }) {
    const present = documents.filter((d) => d.url);
    const missing = documents.filter((d) => !d.url);

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {present.map((doc) => (
                    <a
                        key={doc.key}
                        href={doc.url!}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative block aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 bg-gray-100"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={doc.url!} alt={doc.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <span className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="flex items-center gap-1 text-xs font-bold text-white">
                                <ExternalLink className="w-3 h-3" /> View
                            </span>
                        </span>
                        <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 truncate">
                            {doc.label}
                        </span>
                    </a>
                ))}
            </div>

            {missing.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Missing documents</p>
                    <div className="flex flex-wrap gap-1.5">
                        {missing.map((doc) => (
                            <Badge key={doc.key} variant="outline" className="text-xs text-amber-700 border-amber-300 bg-white">
                                <FileX2 className="w-3 h-3 mr-1" /> {doc.label}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function ProviderDetailModal({ providerId, open, onClose }: { providerId: string; open: boolean; onClose: () => void }) {
    const { data: provider, isLoading } = useAdminGetProviderApprovalDetailQuery(providerId, { skip: !open });
    const [processApproval, { isLoading: processing }] = useAdminProcessProviderApprovalMutation();
    const [action, setAction] = useState<"approve" | "reject" | null>(null);
    const [notes, setNotes] = useState("");
    const [activeTab, setActiveTab] = useState<"details" | "eligibility" | "documents">("details");

    const handleAction = async () => {
        if (!action || !provider) return;
        if (action === "reject" && !notes.trim()) { toast.error("Please provide a rejection reason"); return; }
        try {
            await processApproval({
                providerId,
                action,
                notes: notes || undefined,
            }).unwrap();
            toast.success(action === "approve" ? "Provider approved!" : "Provider rejected.");
            onClose();
        } catch { toast.error("Action failed. Please try again."); }
    };

    const isDriver = provider?.service_type === "airport_pickup";

    const detailRows = provider ? [
        ["Full Name", provider.full_name || provider.user_email],
        ["Email", provider.user_email],
        ["City / Country", provider.city ? `${provider.city}, ${provider.country_code?.toUpperCase()}` : provider.country_code?.toUpperCase()],
        ["NIN (National ID)", provider.national_identity_number],
        ["Emergency Contact", provider.emergency_contact],
        ["Submitted", new Date(provider.registered_at).toLocaleDateString()],
        ...(provider.reviewed_at ? [["Reviewed", new Date(provider.reviewed_at).toLocaleString()] as [string, string]] : []),
    ].filter((row) => row[1] != null) as [string, string][] : [];

    const licenseRows = isDriver ? [
        ["License Number", provider?.license_number],
        ["License State/Country", provider?.license_state_country],
        ["License Expiry", provider?.license_expiration_date
            ? new Date(provider.license_expiration_date).toLocaleDateString()
            : undefined],
        ["Vehicle Model", provider?.vehicle_model],
        ["Vehicle Year", provider?.vehicle_year],
        ["Vehicle Colour", provider?.vehicle_colour],
        ["License Plate", provider?.license_plate_number],
        ["VIN", provider?.vin],
    ].filter((row) => row[1] != null) as [string, string][] : [];

    const chaperoneRows = !isDriver ? [
        ["SIM Card Reference", provider?.sim_card_reference],
        ["TFN Reference", provider?.tax_file_number_reference],
        ["Offers Translation", provider?.offers_translation_service ? "Yes" : undefined],
        ["Offers Registration Help", provider?.offers_registration_service ? "Yes" : undefined],
    ].filter((row) => row[1] != null) as [string, string][] : [];

    const showActions = provider && ["pending"].includes(provider.approval_status);

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-gray-900">
                        <User className="w-5 h-5 text-teal-700" />
                        {isLoading ? "Loading..." : provider?.full_name || provider?.user_email}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-700" />
                    </div>
                )}

                {provider && (
                    <>
                        {/* Status + type */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <TypeBadge type={provider.service_type} />
                                <StatusBadge status={provider.approval_status} />
                            </div>
                            {provider.eligibility && (
                                <span className={`text-xs font-bold ${provider.eligibility.eligible ? "text-emerald-700" : "text-red-600"}`}>
                                    Eligibility: {provider.eligibility.passed}/{provider.eligibility.total}
                                </span>
                            )}
                        </div>

                        {provider.approval_status === "rejected" && provider.rejection_reason && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                                <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Rejection reason</p>
                                <p className="text-sm text-red-700">{provider.rejection_reason}</p>
                            </div>
                        )}

                        {/* Tabs */}
                        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mt-2">
                            {(["details", "eligibility", "documents"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTab(t)}
                                    className={`flex-1 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize ${activeTab === t ? "bg-white shadow text-teal-700" : "text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    {t} {t === "documents" && `(${(provider.documents ?? []).filter((d) => d.url).length})`}
                                </button>
                            ))}
                        </div>

                        {/* Details tab */}
                        {activeTab === "details" && (
                            <div className="space-y-4 mt-2">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applicant</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {[
                                            { icon: <User className="w-3.5 h-3.5" />, value: provider.full_name || provider.user_email },
                                            { icon: <Mail className="w-3.5 h-3.5" />, value: provider.user_email },
                                            { icon: <MapPin className="w-3.5 h-3.5" />, value: provider.city ? `${provider.city}, ${provider.country_code?.toUpperCase()}` : provider.country_code?.toUpperCase() },
                                            { icon: <Phone className="w-3.5 h-3.5" />, value: provider.emergency_contact },
                                            { icon: <CreditCard className="w-3.5 h-3.5" />, value: provider.national_identity_number },
                                        ].map((row, i) => row.value && (
                                            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                                                <span className="text-gray-400 shrink-0">{row.icon}</span>
                                                <span className="truncate font-medium">{row.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {isDriver && licenseRows.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Driver License & Vehicle</p>
                                        <div className="space-y-2">
                                            {licenseRows.map(([label, value]) => (
                                                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                                                    <span className="text-gray-500 shrink-0 mr-4">{label}</span>
                                                    <span className="font-medium text-gray-800 text-right">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {!isDriver && chaperoneRows.length > 0 && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Chaperone Details</p>
                                        <div className="space-y-2">
                                            {chaperoneRows.map(([label, value]) => (
                                                <div key={label} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                                                    <span className="text-gray-500 shrink-0 mr-4">{label}</span>
                                                    <span className="font-medium text-gray-800 text-right">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {provider.bio && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bio</p>
                                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl p-3">{provider.bio}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Eligibility tab */}
                        {activeTab === "eligibility" && provider.eligibility && (
                            <div className="mt-2">
                                <EligibilityPanel eligibility={provider.eligibility} />
                            </div>
                        )}

                        {/* Documents tab */}
                        {activeTab === "documents" && (
                            <div className="mt-2">
                                {(provider.documents ?? []).length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-8">No documents uploaded.</p>
                                ) : (
                                    <DocumentsPanel documents={provider.documents} />
                                )}
                            </div>
                        )}

                        {/* Action panel */}
                        {showActions && (
                            <div className="border-t border-gray-100 pt-4 mt-4 space-y-3">
                                <p className="text-sm font-bold text-gray-700">Take Action</p>
                                {provider.eligibility && !provider.eligibility.eligible && (
                                    <p className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                                        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                        This application does not meet all eligibility criteria. Review before approving.
                                    </p>
                                )}
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
                                        <p className="text-xs text-emerald-800 font-semibold">Optional note for the provider:</p>
                                        <Textarea
                                            placeholder="e.g. Welcome aboard! You can now receive ride requests."
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
                            </div>
                        )}
                    </>
                )}

                <DialogFooter className="gap-2 mt-2">
                    <Button variant="outline" onClick={onClose} disabled={processing}>Close</Button>
                    {action && (
                        <Button
                            onClick={handleAction} disabled={processing}
                            className={action === "approve"
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-red-600 hover:bg-red-700 text-white"}
                        >
                            {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                action === "approve" ? <><FileCheck2 className="w-4 h-4 mr-1" /> Confirm Approval</> : <><FileX2 className="w-4 h-4 mr-1" /> Confirm Rejection</>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ── Row ───────────────────────────────────────────────────────────────────────
function ProviderRow({ provider }: { provider: ProviderListItem }) {
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">
                            {(provider.full_name || provider.user_email || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{provider.full_name || provider.user_email}</p>
                            <p className="text-xs text-gray-400 truncate">{provider.user_email}</p>
                        </div>
                    </div>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                    <TypeBadge type={provider.service_type} />
                </td>
                <td className="px-4 py-3">
                    <StatusBadge status={provider.approval_status} />
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-sm text-gray-500">
                    {provider.city ? `${provider.city}, ${provider.country_code?.toUpperCase()}` : provider.country_code?.toUpperCase()}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {new Date(provider.registered_at).toLocaleDateString()}
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
                <ProviderDetailModal providerId={provider.id} open={modalOpen} onClose={() => setModalOpen(false)} />
            )}
        </>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminProviderApprovals() {
    const [serviceType, setServiceType] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [search, setSearch] = useState("");

    const { data: providers, isLoading, refetch } = useAdminGetAllProviderApprovalsQuery({
        status: statusFilter || undefined,
        service_type: serviceType || undefined,
    });

    const filtered = (providers ?? []).filter((p) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (p.full_name ?? "").toLowerCase().includes(q)
            || (p.user_email ?? "").toLowerCase().includes(q)
            || (p.city ?? "").toLowerCase().includes(q);
    });

    const serviceTabs = [
        { value: "", label: "All Types", icon: null },
        { value: "airport_pickup", label: "Drivers", icon: <Car className="w-3 h-3" /> },
        { value: "chaperone", label: "Chaperones", icon: <Users className="w-3 h-3" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50/40 p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-teal-700" /> Provider Approvals
                    </h1>
                    <p className="text-gray-500 text-sm mt-0.5">Review, approve, or reject driver &amp; chaperone applications</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Stats */}
            <StatsBar />

            {/* Service type tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {serviceTabs.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setServiceType(t.value)}
                        className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${serviceType === t.value
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
                        placeholder="Search by name, email, or city..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                    {Object.entries({ "": "All", pending: "Pending", approved: "Approved", rejected: "Rejected" }).map(([val, label]) => (
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
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-semibold">No providers found</p>
                        <p className="text-sm mt-1">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    {["Provider", "Type", "Status", "Location", "Submitted", ""].map((h) => (
                                        <th key={h} className={`px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${h === "Type" ? "hidden sm:table-cell" :
                                                h === "Location" ? "hidden md:table-cell" :
                                                    h === "Submitted" ? "hidden lg:table-cell" : ""
                                            }`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((provider) => <ProviderRow key={provider.id} provider={provider} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            <p className="text-xs text-gray-400 text-right mt-3">
                {filtered.length} provider{filtered.length !== 1 ? "s" : ""} shown
            </p>
        </div>
    );
}
