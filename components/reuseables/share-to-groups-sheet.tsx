'use client'

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Search, Users, Check, X, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SafeImage } from "@/components/reuseables/SafeImage";
import { CommunityAvatar } from "@/components/reuseables/CommunityAvatar";
import { useGetMyCommunitiesQuery } from "@/lib/api/communityApiSlice";
import { useShareListingToGroupsMutation } from "@/lib/api/communityApiSlice";
import { useCurrency } from "@/components/contexts/currencyContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ShareToGroupsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  listingTitle: string;
  listingImage?: string;
  listingPrice?: number;
  listingCurrency?: string;
  listingLocation?: string;
}

export default function ShareToGroupsSheet({
  open,
  onOpenChange,
  listingId,
  listingTitle,
  listingImage,
  listingPrice,
  listingCurrency = "AUD",
  listingLocation,
}: ShareToGroupsSheetProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: groups = [], isLoading } = useGetMyCommunitiesQuery();
  const [shareListing, { isLoading: isSharing }] = useShareListingToGroupsMutation();
  const { formatPrice } = useCurrency();

  const filtered = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
    );
  }, [groups, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleShare = async () => {
    if (selected.size === 0) {
      toast.error("Select at least one group");
      return;
    }
    try {
      const result = await shareListing({
        listing_id: listingId,
        community_ids: Array.from(selected),
      }).unwrap();
      toast.success(result.detail);
      onOpenChange(false);
      setSelected(new Set());
      setSearch("");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to share listing");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelected(new Set());
    setSearch("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden rounded-2xl bg-white shadow-2xl border-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Share to Groups
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-full p-1.5 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </DialogHeader>

        {/* Listing preview card */}
        {listingTitle && (
          <div className="mx-5 mb-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50/80">
            <div className="flex gap-3 p-3">
              {listingImage && (
                <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-white shadow-sm">
                  <SafeImage
                    src={listingImage}
                    alt={listingTitle}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                  {listingTitle}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  {listingPrice != null && listingPrice > 0 && (
                    <span className="text-sm font-black text-teal-700">
                      {formatPrice(listingPrice, listingCurrency)}
                    </span>
                  )}
                  {listingLocation && (
                    <span className="text-[11px] text-gray-400 font-medium flex items-center gap-0.5">
                      <MapPin size={10} />
                      {listingLocation}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="px-5 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 bg-gray-50 border-gray-200 rounded-xl text-sm"
            />
          </div>
        </div>

        {/* Groups list */}
        <div className="max-h-[45vh] overflow-y-auto px-2 pb-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 px-5">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 font-medium">
                {groups.length === 0
                  ? "You haven't joined any groups yet"
                  : "No groups match your search"}
              </p>
            </div>
          ) : (
            filtered.map((group) => {
              const isSelected = selected.has(group.id);
              return (
                <button
                  key={group.id}
                  onClick={() => toggle(group.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                    isSelected
                      ? "bg-teal-50 border border-teal-200"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="h-11 w-11 flex-shrink-0 relative rounded-full overflow-hidden bg-gray-100">
                    <CommunityAvatar
                      name={group.name}
                      className="h-full w-full rounded-full"
                      textClassName="text-[14px]"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">
                      {group.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {group.member_count} {group.member_count === 1 ? "member" : "members"}
                    </p>
                  </div>

                  <div
                    className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected
                        ? "bg-teal-600 border-teal-600"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <Button
            onClick={handleShare}
            disabled={selected.size === 0 || isSharing}
            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSharing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {selected.size === 0
              ? "Select groups to share"
              : `Share to ${selected.size} ${selected.size === 1 ? "group" : "groups"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
