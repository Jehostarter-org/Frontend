"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import {
  ArrowLeft,
  Car,
  MapPin,
  Clock,
  Users,
  Briefcase,
  Plane,
  Shield,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { useCurrency } from "@/components/contexts/currencyContext";
import { useGetAvailableServiceRequestsQuery, useGetMyProviderJobsQuery, type ServiceRequest } from "@/lib/api/riderApiSlice";
import { formatDistanceToNow } from "date-fns";

const ACTIVE_STATUSES = ["accepted", "in_progress"];

function formatCurrency(amount: string | null | undefined, currency: string) {
  if (!amount) return null;
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
  amount: string | null | undefined,
  currency: string,
  convert: (amount: number, currency: string) => string
): string | null {
  if (!amount) return null;
  try {
    return convert(Number(amount), currency || "NGN");
  } catch {
    return `${currency} ${amount}`;
  }
}

function timeAgo(dateStr: string) {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

function ServiceTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "airport_pickup":
      return <Plane className="h-5 w-5 text-teal-600" />;
    case "chaperone":
      return <Shield className="h-5 w-5 text-purple-600" />;
    case "home_inspection":
      return <MapPin className="h-5 w-5 text-blue-600" />;
    default:
      return <Car className="h-5 w-5 text-gray-500" />;
  }
}

function RideCard({
  ride,
  onAccept,
}: {
  ride: ServiceRequest;
  onAccept: (id: string) => void;
}) {
  const { formatPrice: convertPrice } = useCurrency();
  const price = formatCurrencyConverted(ride.price, ride.currency, convertPrice);
  const isChaperone = ride.service_type === "chaperone";

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5 ${
      isChaperone ? "hover:border-purple-300" : "hover:border-teal-300"
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isChaperone ? "bg-purple-50" : "bg-teal-50"
          }`}>
            <ServiceTypeIcon type={ride.service_type} />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm capitalize">
              {isChaperone ? "Chaperone Service" : ride.service_type.replace(/_/g, " ")}
            </p>
            <p className="text-xs text-gray-400">{timeAgo(ride.created_at)}</p>
          </div>
        </div>
        {price && (
          <div className="text-right">
            <p className={`text-lg font-black ${isChaperone ? "text-purple-700" : "text-teal-700"}`}>{price}</p>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {/* Requester */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span className="font-medium">{ride.requester_name}</span>
        </div>

        {/* Location */}
        {(ride.city || ride.country_code) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span>
              {[ride.city, ride.country_code].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {isChaperone ? (
          <>
            {ride.chaperone_details?.help_type && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-purple-500 flex-shrink-0" />
                <span>Help: {ride.chaperone_details.help_type.replace(/_/g, " ")}</span>
              </div>
            )}
            {ride.description && (
              <div className="mt-2 p-2 bg-purple-50 rounded-lg text-xs text-gray-500">
                <span className="font-semibold text-gray-600">Details: </span>
                {ride.description}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Airport details */}
            {ride.airport_pickup_details?.airport && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Plane className="h-4 w-4 text-teal-500 flex-shrink-0" />
                <span>
                  {ride.airport_pickup_details.airport}
                  {ride.airport_pickup_details.terminal ? ` — ${ride.airport_pickup_details.terminal}` : ""}
                </span>
              </div>
            )}

            {/* Arrival time */}
            {ride.airport_pickup_details?.arrival_datetime && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span>Flight arrives: {new Date(ride.airport_pickup_details.arrival_datetime).toLocaleString("en-US", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}</span>
              </div>
            )}

            {/* Passengers & bags */}
            {(ride.airport_pickup_details?.num_passengers || ride.airport_pickup_details?.num_bags) && (
              <div className="flex items-center gap-4 text-xs text-gray-400">
                {ride.airport_pickup_details?.num_passengers && (
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {ride.airport_pickup_details.num_passengers} {ride.airport_pickup_details.num_passengers === 1 ? "passenger" : "passengers"}
                  </span>
                )}
                {ride.airport_pickup_details?.num_bags && ride.airport_pickup_details.num_bags > 0 && (
                  <span>{ride.airport_pickup_details.num_bags} {ride.airport_pickup_details.num_bags === 1 ? "bag" : "bags"}</span>
                )}
              </div>
            )}

            {/* Pickup address */}
            {ride.pickup_address && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg text-xs text-gray-500">
                <span className="font-semibold text-gray-600">Pickup: </span>
                {ride.pickup_address}
              </div>
            )}
          </>
        )}
      </div>

      {/* Action */}
      <Button
        onClick={() => onAccept(ride.id)}
        className={`w-full text-white font-bold py-3 rounded-xl transition-all active:scale-[0.98] ${
          isChaperone ? "bg-purple-700 hover:bg-purple-800" : "bg-[#2d7a7a] hover:bg-[#246060]"
        }`}
      >
        {isChaperone ? "Accept Request" : "Accept Job"}
      </Button>
    </div>
  );
}

function ActiveJobCard({ ride }: { ride: ServiceRequest }) {
  const router = useRouter();
  const airport = ride.airport_pickup_details?.airport;
  const badgeColor = ride.status === "accepted" ? "bg-blue-100 text-blue-700" : "bg-teal-100 text-teal-700";
  const badgeLabel = ride.status === "accepted" ? "Accepted" : "In Progress";

  return (
    <div className="bg-blue-50 rounded-2xl border border-blue-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{ride.requester_name}</p>
            <p className="text-xs text-gray-500">{airport || ride.pickup_address}</p>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeColor}`}>
          {badgeLabel}
        </span>
      </div>
      <Button
        onClick={() => {
          sessionStorage.setItem("activeDriverServiceId", ride.id);
          router.push("/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-action");
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl"
      >
        Continue Trip
      </Button>
    </div>
  );
}

export default function AvailableJobsPage() {
  const router = useRouter();
  const {
    data: rides = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetAvailableServiceRequestsQuery(undefined, {
    pollingInterval: 15000,
  });
  const { data: myJobs = [], isLoading: isLoadingMyJobs } = useGetMyProviderJobsQuery();
  const activeJobs = myJobs.filter((j) => ACTIVE_STATUSES.includes(j.status));

  const handleAccept = (serviceRequestId: string) => {
    sessionStorage.setItem("activeDriverServiceId", serviceRequestId);
    const ride = rides.find((r) => r.id === serviceRequestId);
    if (ride?.service_type === "chaperone") {
      router.push(`/dashboard/chaperone/chaperone-confirmation?id=${serviceRequestId}`);
    } else {
      router.push(
        `/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-confirmation?id=${serviceRequestId}`
      );
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto px-4 py-6 mb-10">
        <div className="mb-4">
          <Button
            variant="ghost"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Driver Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {activeJobs.length > 0
                ? `${activeJobs.length} active job${activeJobs.length !== 1 ? "s" : ""}`
                : "No active jobs"}
              {rides.length > 0 && ` · ${rides.length} available`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Active Jobs */}
        {!isLoadingMyJobs && activeJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-500" />
              My Active Jobs
            </h2>
            <div className="space-y-3">
              {activeJobs.map((ride) => (
                <ActiveJobCard key={ride.id} ride={ride} />
              ))}
            </div>
          </div>
        )}

        {/* Available Jobs Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Available Jobs — auto-refreshes every 15s
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            <p className="text-gray-400 text-sm">Loading available jobs...</p>
          </div>
        ) : rides.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <Car className="h-10 w-10 text-gray-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-700">No jobs available</h2>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                There are no airport pickup requests in your area right now. Check back soon!
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              className="bg-[#2d7a7a] hover:bg-[#246060] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} onAccept={handleAccept} />
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
