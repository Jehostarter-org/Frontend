"use client";

import React, { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Bell, MessageSquare, Heart, ShoppingCart,
  User, Inbox, Trash2, MoreVertical, Loader2,
  Plane, MapPin, Clock, Users, Briefcase, CheckCircle2,
  Car, AlertCircle, RotateCcw, ChevronRight, Shield, Headphones,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/components/contexts/currencyContext";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications, type GqlNotification } from "@/components/contexts/notification-context";
import { useDismissNotificationMutation } from "@/lib/api/notificationsApiSlice";
import { useAuth } from "@/components/contexts/auth-context";
import { useDriverJobSocket } from "@/hooks/Usedriverjobsocket";
import { useGetMyServiceRequestsQuery, useGetMyProviderProfilesQuery, useGetAvailableServiceRequestsQuery, type ServiceRequest } from "@/lib/api/riderApiSlice";
import { useStartConversationMutation } from "@/lib/api/messagesApiSlice";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

// ── Unified feed item type ──────────────────────────────────────────────────

interface FeedItem {
  id: string;
  kind: "notification" | "ride";
  timestamp: string;
  isRead: boolean;
  // notification fields
  notification?: GqlNotification;
  // ride fields
  ride?: {
    id: string;
    serviceType?: string;
    airport?: string;
    terminal?: string;
    pickupPoint?: string;
    destination?: string;
    arrivalTime?: string;
    numPassengers?: number;
    numBags?: number;
    price?: string;
    currency?: string;
    description?: string;
    createdAt: string;
    status?: string;
    isOwnBooking?: boolean;
    providerId?: string | number;
  };
}

// ── Icon helpers ────────────────────────────────────────────────────────────

function NotifIcon({ type }: { type: string }) {
  switch (type) {
    case "comment":          return <MessageSquare className="w-4 h-4 text-blue-500" />;
    case "like":             return <Heart className="w-4 h-4 text-rose-500" fill="currentColor" />;
    case "shop_inquiry":     return <ShoppingCart className="w-4 h-4 text-emerald-500" />;
    case "support_message":  return <Headphones className="w-4 h-4 text-teal-500" />;
    case "service_accepted":
    case "service_updated":
    case "service_completed":
    case "service_cancelled": return <Bell className="w-4 h-4 text-amber-500" />;
    default:                 return <User className="w-4 h-4 text-slate-400" />;
  }
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: string | null, currency: string) {
  if (!amount) return "—";
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency || "NGN",
      minimumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatCurrencyConverted(
  amount: string | null,
  currency: string,
  convert: (amount: number, currency: string) => string
): string {
  if (!amount) return "—";
  try {
    return convert(Number(amount), currency || "NGN");
  } catch {
    return `${currency} ${amount}`;
  }
}

// ── Notification item ───────────────────────────────────────────────────────

// ── Map notification types/links to correct frontend routes ────────────────
function resolveNotifLink(notification: GqlNotification): string | null {
  const { notificationType, link } = notification;
  // If no link at all, nothing to view
  if (!link) return null;
  // Community message → straight to the group chat (backend link has ?group=<id>)
  if (notificationType === "community_message") {
    const groupMatch = link.match(/[?&]group=([^&]+)/);
    return groupMatch
      ? `/dashboard/community?group=${encodeURIComponent(groupMatch[1])}`
      : "/dashboard/community";
  }
  // Other community notifications (post/invite) → community page
  if (notificationType === "community_post" || notificationType === "community_invite") {
    return "/dashboard/community";
  }
  // Support reply → straight to the support chat
  if (notificationType === "support_message") {
    return "/support";
  }
  // Direct message → straight to the person's chat thread (backend link: /messages/<id>/)
  if (notificationType === "direct_message") {
    const match = link.match(/\/(\d+)\/?$/);
    return match
      ? `/dashboard/community?tab=messages&conversation=${match[1]}`
      : "/dashboard/community?tab=messages";
  }
  // Service/ride notifications → activity page (they're already here)
  if (notificationType?.startsWith("service_")) {
    return "/dashboard/notification";
  }
  // Shop inquiry → marketplace
  if (notificationType === "shop_inquiry") {
    return "/dashboard/product/marketplace";
  }
  // Default: use the link as-is, prefixed with /dashboard if needed
  if (link.startsWith("/")) return `/dashboard${link}`;
  return `/dashboard/${link}`;
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
  onView,
}: {
  notification: GqlNotification;
  onMarkRead: () => void;
  onDelete: () => void;
  onView: (link: string) => void;
}) {
  return (
    <div
      className={`group relative flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${
        notification.isRead
          ? "bg-white/50 border-slate-100 grayscale-[0.5]"
          : "bg-white border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-200/50"
      }`}
    >
      {!notification.isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-2xl" />
      )}

      {/* Avatar */}
      <div className="relative h-12 w-12 flex-shrink-0">
        <div className="h-full w-full overflow-hidden rounded-full bg-slate-100 ring-2 ring-white shadow-sm">
          {notification.actor?.avatar ? (
            <Image
              src={notification.actor.avatar}
              alt={notification.actor.username}
              width={48} height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-teal-50 text-teal-600 font-bold text-lg">
              {notification.actor?.username?.charAt(0).toUpperCase() ?? "J"}
            </div>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-md ring-1 ring-slate-100">
          <NotifIcon type={notification.notificationType} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className={`text-sm leading-snug ${notification.isRead ? "text-slate-500" : "text-slate-900 font-bold"}`}>
            {notification.title}
          </p>
          <span className="text-[10px] font-black text-slate-300 whitespace-nowrap pt-0.5 uppercase tracking-tighter">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        {notification.message && (
          <div className="mt-2 p-3 rounded-xl bg-slate-50/50 border border-slate-100/50">
            <p className="text-xs text-slate-600 font-medium italic">
              {notification.message}
            </p>
          </div>
        )}

        {(() => {
          const resolvedLink = resolveNotifLink(notification);
          if (!resolvedLink) return null;
          return (
            <button
              onClick={() => onView(resolvedLink)}
              className="mt-2 inline-block text-[10px] font-black text-teal-600 uppercase tracking-widest hover:underline cursor-pointer"
            >
              View →
            </button>
          );
        })()}

        {!notification.isRead && (
          <button
            onClick={onMarkRead}
            className="mt-2 block text-[10px] font-black text-teal-600 uppercase tracking-widest hover:text-teal-700 transition-colors"
          >
            Mark as read
          </button>
        )}
      </div>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border-slate-100 shadow-xl">
          <DropdownMenuItem
            onClick={onDelete}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 focus:text-red-600 focus:bg-red-50"
          >
            <Trash2 size={14} /> Dismiss
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Status badge helpers ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending:   { label: "Searching", bg: "bg-amber-100", text: "text-amber-700", icon: <RotateCcw className="w-3.5 h-3.5" /> },
  accepted:  { label: "Driver Found", bg: "bg-blue-100", text: "text-blue-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  in_progress: { label: "In Progress", bg: "bg-teal-100", text: "text-teal-700", icon: <Car className="w-3.5 h-3.5" /> },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: "Cancelled", bg: "bg-red-100", text: "text-red-600", icon: <AlertCircle className="w-3.5 h-3.5" /> },
};

// ── My booking item (rider's own rides) ───────────────────────────────────

function MyBookingItem({
  ride,
  onView,
  onMessage,
}: {
  ride: FeedItem["ride"];
  onView: (id: string) => void;
  onMessage?: (serviceType: string, providerId: string | number) => void;
}) {
  const { formatPrice: convertPrice } = useCurrency();
  if (!ride) return null;
  const status = ride.status || "pending";
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const isChaperone = ride.serviceType === "chaperone";

  const statusLabel = isChaperone && status === "accepted" ? "Chaperone Assigned" : cfg.label;
  const statusIcon = isChaperone && status === "accepted" ? <Shield className="w-3.5 h-3.5" /> : cfg.icon;

  const accentBarClass = isChaperone ? "bg-purple-500" : "bg-blue-500";
  const iconBgClass = isChaperone ? "bg-purple-50" : "bg-slate-100";
  const iconColorClass = isChaperone ? "text-purple-600" : "text-slate-600";

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md p-6 transition-all duration-300 shadow-sm">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentBarClass} rounded-l-2xl`} />

      {/* Status badge */}
      <div className="absolute top-4 right-4">
        <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full", cfg.bg, cfg.text)}>
          {statusIcon} {statusLabel}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Ride Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`${iconBgClass} p-2 rounded-xl`}>
              {isChaperone ? (
                <Shield className={`w-5 h-5 ${iconColorClass}`} />
              ) : (
                <Plane className={`w-5 h-5 ${iconColorClass}`} />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {isChaperone ? "Chaperone Service" : (ride.airport || "Airport Pickup")}
              </p>
              <p className="text-xs text-gray-500">
                {isChaperone
                  ? (ride.description || "Help requested")
                  : `${ride.terminal && `${ride.terminal} · `}${ride.pickupPoint || "Terminal pickup"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1">
              {isChaperone
                ? (ride.description || "Service location")
                : (ride.destination || "Destination not specified")}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
            {!isChaperone && ride.arrivalTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(ride.arrivalTime).toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
            {!isChaperone && ride.numPassengers && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {ride.numPassengers} pax
              </span>
            )}
            {!isChaperone && ride.numBags && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {ride.numBags} bags
              </span>
            )}
            <span>{timeAgo(ride.createdAt)}</span>
          </div>
        </div>

        {/* Price + Actions */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">
              {formatCurrencyConverted(ride.price ?? null, ride.currency ?? "NGN", convertPrice)}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              {ride.currency}
            </p>
          </div>

          {isChaperone && status === "accepted" && onMessage && ride.providerId && (
            <Button
              onClick={() => onMessage(ride.serviceType!, ride.providerId!)}
              className="px-6 py-2 rounded-xl font-bold text-xs transition-all shadow-md bg-purple-600 hover:bg-purple-700 text-white active:scale-[0.98]"
            >
              Message Chaperone
            </Button>
          )}

          <button
            onClick={() => onView(ride.id)}
            className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 cursor-pointer transition-colors"
          >
            View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Available ride request item (for drivers) ──────────────────────────────

function RideRequestItem({
  ride,
  onAccept,
  onView,
}: {
  ride: FeedItem["ride"];
  onAccept: (id: string, serviceType?: string) => void;
  onView: (id: string, serviceType?: string) => void;
}) {
  const { formatPrice: convertPrice } = useCurrency();
  if (!ride) return null;

  const isChaperone = ride.serviceType === "chaperone";

  const accentColor = isChaperone ? "purple" : "teal";
  const borderClass = isChaperone
    ? "border-2 border-purple-100 hover:border-purple-200"
    : "border-2 border-teal-100 hover:border-teal-200";
  const barClass = isChaperone ? "bg-purple-500" : "bg-teal-500";
  const badgeClass = isChaperone
    ? "bg-purple-100 text-purple-700"
    : "bg-teal-100 text-teal-700";
  const iconBgClass = isChaperone ? "bg-purple-50" : "bg-teal-50";
  const iconColorClass = isChaperone ? "text-purple-600" : "text-teal-600";
  const priceColorClass = isChaperone ? "text-purple-700" : "text-teal-700";
  const btnBgClass = isChaperone
    ? "bg-purple-700 hover:bg-purple-800"
    : "bg-teal-700 hover:bg-teal-800";
  const linkColorClass = isChaperone ? "text-purple-600" : "text-teal-600";

  return (
    <div className={`group relative bg-white rounded-2xl ${borderClass} hover:shadow-md p-6 transition-all duration-300 shadow-sm`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${barClass} rounded-l-2xl`} />

      {/* New badge */}
      <div className="absolute top-4 right-4">
        <span className={`px-2 py-0.5 ${badgeClass} text-[10px] font-black uppercase tracking-widest rounded-full`}>
          {isChaperone ? "New Request" : "New Ride"}
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Ride Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`${iconBgClass} p-2 rounded-xl`}>
              {isChaperone ? (
                <Shield className={`w-5 h-5 ${iconColorClass}`} />
              ) : (
                <Plane className={`w-5 h-5 ${iconColorClass}`} />
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {isChaperone ? "Chaperone Service" : (ride.airport || "Airport Pickup")}
              </p>
              <p className="text-xs text-gray-500">
                {isChaperone
                  ? (ride.description || "Help requested")
                  : `${ride.terminal && `${ride.terminal} · `}${ride.pickupPoint || "Terminal pickup"}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1">
              {isChaperone
                ? (ride.description || "Service location not specified")
                : (ride.destination || "Destination not specified")}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
            {!isChaperone && ride.arrivalTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {new Date(ride.arrivalTime).toLocaleTimeString("en-US", {
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
            )}
            {!isChaperone && ride.numPassengers && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {ride.numPassengers} pax
              </span>
            )}
            {!isChaperone && ride.numBags && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {ride.numBags} bags
              </span>
            )}
            <span>{timeAgo(ride.createdAt)}</span>
          </div>
        </div>

        {/* Price + Accept */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
          <div className="text-right">
            <p className={`text-2xl font-black ${priceColorClass}`}>
              {formatCurrencyConverted(ride.price ?? null, ride.currency ?? "NGN", convertPrice)}
            </p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              {ride.currency}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={() => onAccept(ride.id, ride.serviceType)}
              className={cn(
                "px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md",
                btnBgClass, "text-white",
                "active:scale-[0.98]"
              )}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isChaperone ? "Accept Request" : "Accept Ride"}
            </Button>
            {!isChaperone && (
              <button
                onClick={() => onView(ride.id, ride.serviceType)}
                className={`text-[10px] font-black ${linkColorClass} uppercase tracking-widest hover:underline cursor-pointer text-center`}
              >
                View Details →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100">
      <div className="bg-slate-50 p-8 rounded-full mb-6">
        <Inbox className="w-12 h-12 text-slate-200" />
      </div>
      <h3 className="text-xl font-bold text-slate-900">
        {isFiltered ? "No unread alerts" : "Quiet in here..."}
      </h3>
      <p className="text-slate-400 text-sm mt-1">
        {isFiltered ? "You've handled everything!" : "We'll let you know when things happen."}
      </p>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function NotificationPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { notifications, isLoading: loadingNotifs, markAsRead, markAllAsRead } = useNotifications();

  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(() => new Set());
  const [dismissNotification] = useDismissNotificationMutation();

  // ── Check if user is a registered driver ────────────────────────────
  const { data: providerProfiles } = useGetMyProviderProfilesQuery();
  const isDriver = useMemo(
    () => (providerProfiles ?? []).some((p) => p.is_active && ["airport_pickup", "chaperone"].includes(p.service_type)),
    [providerProfiles]
  );

  // ── Available rides — WebSocket (real-time) + REST poll (full detail, drivers only) ──
  const [wsRides, setWsRides] = useState<any[]>([]);
  const [claimedRideIds, setClaimedRideIds] = useState<Set<string>>(new Set());

  useDriverJobSocket({
    token,
    enabled: !!token && isDriver,
    onNewJob: useCallback((job: any) => {
      const jobId = job.id ?? job.service_id;
      setWsRides((prev) => {
        const exists = prev.some((r) => (r.id ?? r.service_id) === jobId);
        if (exists) return prev;
        return [job, ...prev];
      });
    }, []),
    onJobClaimed: useCallback((serviceId: string) => {
      setClaimedRideIds((prev) => new Set([...prev, serviceId]));
      setWsRides((prev) => prev.filter((r) => r.id !== serviceId));
    }, []),
  });

  // REST poll — only for drivers, every 15 s. Gives full AirportPickupDetails
  // (terminal, pickup_point, arrival_datetime, num_passengers, num_bags)
  // that the WS minimal payload doesn't include.
  const {
    data: restAvailableJobs,
    isLoading: loadingAvailableJobs,
  } = useGetAvailableServiceRequestsQuery(undefined, {
    skip: !isDriver,
    pollingInterval: 15_000,
  });

  // ── My own bookings — REST API ────────────────────────────────────────
  const { data: myServiceRequests, isLoading: loadingMyRides } = useGetMyServiceRequestsQuery();

  // Map my bookings into FeedItem format
  const myRideItems = useMemo<FeedItem[]>(() => {
    if (!myServiceRequests) return [];
    return myServiceRequests.map((sr: ServiceRequest) => ({
      id: `my-ride-${sr.id}`,
      kind: "ride" as const,
      timestamp: sr.created_at,
      isRead: true,
      ride: {
        id: sr.id,
        serviceType: sr.service_type,
        airport: sr.airport_pickup_details?.airport,
        terminal: sr.airport_pickup_details?.terminal,
        pickupPoint: sr.airport_pickup_details?.pickup_point,
        destination: sr.notes || sr.description,
        arrivalTime: sr.airport_pickup_details?.arrival_datetime,
        numPassengers: sr.airport_pickup_details?.num_passengers,
        numBags: sr.airport_pickup_details?.num_bags,
        price: sr.price ?? undefined,
        currency: sr.currency,
        description: sr.description,
        createdAt: sr.created_at,
        status: sr.status,
        isOwnBooking: true,
        providerId: sr.provider ?? undefined,
      },
    }));
  }, [myServiceRequests]);

  // IDs of the current user's own bookings — used to exclude from available pool
  const myRideIds = useMemo(() => new Set(myRideItems.map((r) => r.ride?.id).filter(Boolean)), [myRideItems]);

  // Merge WS jobs + REST jobs into one deduplicated list.
  // REST jobs (ServiceRequest) have full airport detail; WS jobs arrive first
  // but with minimal payload. We prefer REST data when available for the same ID.
  const allRides = useMemo(() => {
    const restMap = new Map<string, ServiceRequest>();
    (restAvailableJobs ?? []).forEach((sr) => restMap.set(sr.id, sr));

    // Start with WS rides that haven't been claimed and aren't the user's own
    const merged = new Map<string, any>();
    wsRides
      .filter((r) => !claimedRideIds.has(r.id ?? r.service_id) && !myRideIds.has(r.id ?? r.service_id))
      .forEach((r) => {
        const id = r.id ?? r.service_id;
        // Enrich with REST data if available
        const restJob = restMap.get(id);
        merged.set(id, restJob ?? r);
      });

    // Add any REST jobs not yet in WS list (caught by polling before WS fires)
    (restAvailableJobs ?? [])
      .filter((sr) => !claimedRideIds.has(sr.id) && !myRideIds.has(sr.id))
      .forEach((sr) => {
        if (!merged.has(sr.id)) merged.set(sr.id, sr);
      });

    return Array.from(merged.values());
  }, [wsRides, restAvailableJobs, claimedRideIds, myRideIds]);

  // ── Notification processing ──────────────────────────────────────────────
  const visibleNotifications = useMemo(
    () =>
      notifications
        .filter((n) => !hiddenIds.has(n.id))
        .map((n) => (localReadIds.has(n.id) ? { ...n, isRead: true } : n)),
    [notifications, hiddenIds, localReadIds],
  );

  const unreadCount = useMemo(
    () => visibleNotifications.filter((n) => !n.isRead).length,
    [visibleNotifications],
  );

  // ── Merge everything into a unified chronological feed ────────────────────
  const feedItems = useMemo<FeedItem[]>(() => {
    // Map notifications to feed items
    const notifItems: FeedItem[] = visibleNotifications.map((n) => ({
      id: `notif-${n.id}`,
      kind: "notification" as const,
      timestamp: n.createdAt,
      isRead: n.isRead,
      notification: n,
    }));

    // Map driver-facing available rides to feed items.
    // Each entry is either a full ServiceRequest (from REST) or a minimal WS payload.
    // We normalise both shapes here so the card always has full detail.
    const rideItems: FeedItem[] = allRides.map((r: any) => ({
      id: `ride-${r.id ?? r.service_id}`,
      kind: "ride" as const,
      timestamp: r.created_at || new Date().toISOString(),
      isRead: false,
      ride: {
        id: r.id ?? r.service_id,
        serviceType:   r.service_type,
        // REST shape: r.airport_pickup_details.airport  |  WS shape: r.airport
        airport:       r.airport_pickup_details?.airport      ?? r.airport,
        terminal:      r.airport_pickup_details?.terminal     ?? r.terminal,
        pickupPoint:   r.airport_pickup_details?.pickup_point ?? r.pickup_point,
        destination:   r.notes   || r.description,
        arrivalTime:   r.airport_pickup_details?.arrival_datetime ?? r.arrival_time,
        numPassengers: r.airport_pickup_details?.num_passengers   ?? r.num_passengers,
        numBags:       r.airport_pickup_details?.num_bags          ?? r.num_bags,
        price:         r.price,
        currency:      r.currency,
        description:   r.description,
        createdAt:     r.created_at || new Date().toISOString(),
      },
    }));

    // Merge notifications, driver WS rides, and my own bookings
    const merged = [...notifItems, ...rideItems, ...myRideItems];
    merged.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filter
    if (filter === "unread") {
      return merged.filter((item) => {
        if (item.kind === "notification") return !item.isRead;
        return true; // rides are always "new"
      });
    }

    return merged;
  }, [visibleNotifications, allRides, myRideItems, filter]);

  const handleMarkRead = async (id: string) => {
    setLocalReadIds((prev) => new Set([...prev, id]));
    await markAsRead("notifications", id);
  };

  const handleMarkAllRead = async () => {
    setLocalReadIds((prev) => new Set([...prev, ...visibleNotifications.map((n) => n.id)]));
    await markAllAsRead("notifications");
  };

  const handleDelete = async (id: string) => {
    setHiddenIds((prev) => new Set([...prev, id]));
    try {
      await dismissNotification(id).unwrap();
    } catch {
      toast.error("Failed to dismiss notification.");
    }
  };

  const handleAcceptRide = (serviceRequestId: string, serviceType?: string) => {
    sessionStorage.setItem("activeDriverServiceId", serviceRequestId);
    if (serviceType === "chaperone") {
      router.push("/dashboard/chaperone/chaperone-confirmation?id=" + serviceRequestId);
    } else {
      router.push(
        "/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-confirmation?id=" + serviceRequestId
      );
    }
  };

  const [startConversation] = useStartConversationMutation();

  const handleMessage = async (serviceType: string, providerId: string | number) => {
    try {
      const conversation = await startConversation({
        recipient_id: providerId,
        service_type: serviceType,
        initial_message: "Hi! I see you've accepted my request.",
        linked_object_type: "chaperone_service",
        linked_object_id: providerId,
      }).unwrap();
      toast.success("Chat opened with chaperone");
      router.push(`/dashboard/community?tab=messages&conversation=${conversation.id}`);
    } catch {
      toast.error("Could not open conversation. Please try again.");
    }
  };

  const isLoading = loadingNotifs || loadingMyRides || (isDriver && loadingAvailableJobs);

  return (
    <DashboardShell>
      <div className="min-h-screen bg-[#f8fafc]">
        <main className="max-w-3xl mx-auto p-4 md:p-10">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Activity</h1>
              <p className="text-slate-500 font-medium">
                You have{" "}
                <span className="text-teal-600 font-bold">{unreadCount} unread</span>{" "}
                notifications
                {allRides.length > 0 && (
                  <span className="text-teal-600 font-bold"> · {allRides.length} ride{allRides.length !== 1 ? "s" : ""} available</span>
                )}
                {myRideItems.length > 0 && (
                  <span className="text-slate-500 font-bold"> · {myRideItems.length} booking{myRideItems.length !== 1 ? "s" : ""}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-black text-teal-600 uppercase tracking-widest hover:text-teal-700"
                >
                  Mark all read
                </button>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Live
                </span>
              </div>
              <div className="flex bg-slate-200/50 p-1 rounded-xl">
                {(["all", "unread"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                      filter === f
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live indicator */}
          <div className="mb-6 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Real-time updates
            </span>
          </div>

          {/* List */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <p className="text-slate-400 text-sm">Loading activity...</p>
            </div>
          ) : feedItems.length === 0 ? (
            <EmptyState isFiltered={filter === "unread"} />
          ) : (
            <div className="space-y-4">
              {feedItems.map((item) => {
                if (item.kind === "notification" && item.notification) {
                  return (
                    <NotificationItem
                      key={item.id}
                      notification={item.notification}
                      onMarkRead={() => handleMarkRead(item.notification!.id)}
                      onDelete={() => handleDelete(item.id)}
                      onView={(link) => router.push(link)}
                    />
                  );
                }
                if (item.kind === "ride" && item.ride) {
                  // Rider's own bookings show status card; available rides show Accept
                  if (item.ride.isOwnBooking) {
                    const isChaperone = item.ride.serviceType === "chaperone";
                    return (
                      <MyBookingItem
                        key={item.id}
                        ride={item.ride}
                        onView={(id) => {
                          if (isChaperone) {
                            router.push(`/dashboard/chaperone/book-chaperone?serviceRequestId=${id}`);
                          } else {
                            router.push(`/dashboard/airport-pickup/riders-airport-pickup/riders-pickup/vehicle-selection?serviceRequestId=${id}`);
                          }
                        }}
                        onMessage={(st, pid) => handleMessage(st, pid)}
                      />
                    );
                  }
                  return (
                    <RideRequestItem
                      key={item.id}
                      ride={item.ride}
                      onAccept={(id, st) => handleAcceptRide(id, st)}
                      onView={(id, st) => handleAcceptRide(id, st)}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </main>
      </div>
    </DashboardShell>
  );
}
