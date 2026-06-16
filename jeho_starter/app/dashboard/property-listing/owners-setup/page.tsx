"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Plus, Eye, Edit3, Trash2, Globe, Lock,
  MapPin, BedDouble, Bath, Calendar,
  Loader2, AlertCircle, Search, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import {
  useGetPropertiesQuery,
  useDeletePropertyMutation,
  usePublishPropertyMutation,
  useUpdatePropertyMutation,
} from "@/lib/api/propertyApiSlice";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ── Status config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: "Published", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  draft:     { label: "Draft",     color: "text-amber-700",   bg: "bg-amber-50 border-amber-200" },
  rented:    { label: "Rented",    color: "text-blue-700",    bg: "bg-blue-50 border-blue-200" },
  unavailable: { label: "Unavailable", color: "text-gray-600", bg: "bg-gray-50 border-gray-200" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border", config.bg, config.color)}>
      {status === "published" && <Globe className="w-3 h-3" />}
      {status === "draft" && <FileText className="w-3 h-3" />}
      {status === "rented" && <Lock className="w-3 h-3" />}
      {config.label}
    </span>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <Card className="border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteDialog({ open, onOpenChange, onConfirm, title }: {
  open: boolean; onOpenChange: (v: boolean) => void; onConfirm: () => void; title: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delete Property</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">"{title}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Delete</Button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function OwnerPropertiesPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetPropertiesQuery();
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();
  const [publishProperty] = usePublishPropertyMutation();
  const [updateProperty] = useUpdatePropertyMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const properties = data?.results ?? [];
  const total = properties.length;

  // ── Computed stats ──────────────────────────────────────────────────────
  const stats = {
    total,
    published: properties.filter((p: any) => (p.status || (p.is_published ? "published" : "draft")) === "published").length,
    draft: properties.filter((p: any) => (p.status || (p.is_published ? "published" : "draft")) === "draft").length,
    rented: properties.filter((p: any) => p.status === "rented").length,
  };

  // ── Filtered list ───────────────────────────────────────────────────────
  const filtered = properties.filter((p: any) => {
    const matchSearch = !searchQuery ||
      p.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || (p.status || (p.is_published ? "published" : "draft")) === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Actions ─────────────────────────────────────────────────────────────
  const handlePublish = async (id: string) => {
    setActionLoading(id);
    try { await publishProperty(id).unwrap(); }
    catch { console.error("Publish failed"); }
    finally { setActionLoading(null); }
  };

  const handleUnpublish = async (id: string) => {
    setActionLoading(id);
    try { await updateProperty({ id, body: { status: "draft", isPublished: false } as any }).unwrap(); }
    catch { console.error("Unpublish failed"); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setActionLoading(deleteTarget.id);
    try { await deleteProperty(deleteTarget.id).unwrap(); setDeleteTarget(null); }
    catch { console.error("Delete failed"); }
    finally { setActionLoading(null); }
  };

  // ── Loading / Error states ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <DashboardShell>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />)}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (isError) {
    return (
      <DashboardShell>
        <div className="max-w-6xl mx-auto p-6">
          <div className="text-center py-16 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-medium">Failed to load your properties.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>Try Again</Button>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto p-5 animate-in fade-in duration-500">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your listings and track performance</p>
          </div>
          <Button
            onClick={() => router.push("/dashboard/property-listing/owners-setup/create")}
            className="bg-teal-800 hover:bg-teal-900 text-white shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" /> List New Property
          </Button>
        </div>

        {/* ── Stats ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Home} label="Total" value={stats.total} color="bg-gray-100 text-gray-700" />
          <StatCard icon={Globe} label="Published" value={stats.published} color="bg-emerald-100 text-emerald-700" />
          <StatCard icon={FileText} label="Drafts" value={stats.draft} color="bg-amber-100 text-amber-700" />
          <StatCard icon={Lock} label="Rented" value={stats.rented} color="bg-blue-100 text-blue-700" />
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title, city, or state..."
              className="pl-10 h-11 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["all", "published", "draft", "rented"].map((f) => (
              <Button
                key={f}
                variant={statusFilter === f ? "default" : "outline"}
                size="sm"
                className={cn(
                  "capitalize h-9",
                  statusFilter === f && "bg-teal-800 hover:bg-teal-900 text-white"
                )}
                onClick={() => setStatusFilter(f)}
              >
                {f === "all" ? `All (${total})` : f}
              </Button>
            ))}
          </div>
        </div>

        {/* ── Property List ────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            {total === 0 ? (
              <>
                <Home className="h-14 w-14 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">Start listing your property to connect with quality tenants.</p>
                <Button onClick={() => router.push("/dashboard/property-listing/owners-setup/create")} className="bg-teal-800 hover:bg-teal-900">
                  <Plus className="w-4 h-4 mr-2" /> List Your First Property
                </Button>
              </>
            ) : (
              <>
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No matches</h3>
                <p className="text-gray-500">Try adjusting your search or filter.</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((property: any) => {
              const status = property.status || (property.is_published ? "published" : "draft");
              const coverImage = property.images?.[0];
              const price = Number(property.price_amount || 0);

              return (
                <Card key={property.id} className="border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="w-full md:w-52 h-44 md:h-auto bg-gray-100 flex-shrink-0 overflow-hidden relative">
                        {coverImage ? (
                          <img src={coverImage} alt={property.property_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Home className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <StatusBadge status={status} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 group-hover:text-teal-700 transition-colors">
                                {property.property_title || property.propertyTitle || "Untitled"}
                              </h3>
                              <p className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                                <MapPin className="w-3.5 h-3.5" />
                                {[property.city, property.state].filter(Boolean).join(", ")}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-teal-800 text-xl">{formatCurrency(price)}</p>
                              <p className="text-xs text-gray-400 uppercase tracking-wide">
                                Per {property.price_type || "month"}
                              </p>
                            </div>
                          </div>

                          {/* Meta row */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.bedrooms || 1} bed</span>
                            <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms || 1} bath</span>
                            <span className="flex items-center gap-1 capitalize"><Home className="w-3.5 h-3.5" />{property.property_type || "N/A"}</span>
                            {property.available_from && (
                              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />From {new Date(property.available_from).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          <Button
                            variant="outline" size="sm"
                            className="h-8 text-xs"
                            onClick={() => router.push(`/dashboard/property-listing/tenants/property-search/${property.id}`)}
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                          <Button
                            variant="outline" size="sm"
                            className="h-8 text-xs"
                            onClick={() => router.push(`/dashboard/property-listing/owners-setup/create?edit=${property.id}`)}
                          >
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                          </Button>

                          {status === "published" ? (
                            <Button
                              variant="outline" size="sm"
                              className="h-8 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                              onClick={() => handleUnpublish(property.id)}
                              disabled={actionLoading === property.id}
                            >
                              {actionLoading === property.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Lock className="w-3.5 h-3.5 mr-1" />}
                              Unpublish
                            </Button>
                          ) : (
                            <Button
                              variant="outline" size="sm"
                              className="h-8 text-xs text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => handlePublish(property.id)}
                              disabled={actionLoading === property.id}
                            >
                              {actionLoading === property.id ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Globe className="w-3.5 h-3.5 mr-1" />}
                              Publish
                            </Button>
                          )}

                          <div className="flex-1" />

                          <Button
                            variant="ghost" size="sm"
                            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setDeleteTarget({ id: property.id, title: property.property_title || property.propertyTitle || "Untitled" })}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <DeleteDialog
        open={!!deleteTarget}
        onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}
        onConfirm={handleDelete}
        title={deleteTarget?.title ?? ""}
      />
    </DashboardShell>
  );
}
