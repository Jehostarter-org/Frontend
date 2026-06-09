"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  useGetAvailableServiceRequestsQuery,
} from "@/lib/api/riderApiSlice";
import {
  Bell,
  MapPin,
  Plane,
  Clock,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Users,
  Briefcase,
} from "lucide-react";
import DashboardShell from "@/components/dashboard/dashboard-layout";

/**
 * Driver Available Jobs Page
 *
 * Fetches available ride requests via REST API polling (every 10s)
 * and lets the driver accept a ride to begin the pickup flow.
 */
export default function DriverAvailableJobsPage() {
  const router = useRouter();

  // Fetch available (unclaimed) service requests — polls every 10s
  const {
    data: availableJobs,
    isLoading,
    isError,
    refetch,
  } = useGetAvailableServiceRequestsQuery(undefined, {
    pollingInterval: 10_000,
  });

  // Accept a ride — store ID and navigate to confirmation to review before claiming
  const handleClaimJob = async (serviceRequestId: string) => {
    sessionStorage.setItem("activeDriverServiceId", serviceRequestId);
    router.push(
      "/dashboard/airport-pickup/drivers-airport-pickup/drivers-pickup/drivers-pickup-confirmation?id=" + serviceRequestId
    );
  };

  const formatCurrency = (amount: string | null, currency: string) => {
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
  };

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 60_000);
      if (mins < 1) return "Just now";
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <DashboardShell>
      <div className="max-w-4xl mx-auto py-6 px-4 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Available Rides
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Accept a pickup request to start earning
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        {/* Auto-refresh indicator */}
        <div className="mb-6 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Auto-refreshing every 10s
          </span>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin h-10 w-10 text-teal-600" />
            <p className="text-sm font-bold text-gray-400">
              Loading available rides...
            </p>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Bell className="h-12 w-12 text-red-400" />
            <p className="text-red-600 font-bold text-lg">
              Could not load ride requests
            </p>
            <p className="text-gray-500 text-sm">
              Check your connection and try again.
            </p>
            <Button onClick={() => refetch()} className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && availableJobs && availableJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="bg-teal-50 p-6 rounded-full">
              <Bell className="h-10 w-10 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              No rides available right now
            </h3>
            <p className="text-gray-500 text-sm max-w-sm text-center">
              New ride requests will appear here automatically.
              Tap Refresh to check for updates.
            </p>
            <p className="text-xs text-gray-400 font-medium animate-pulse">
              Waiting for ride requests...
            </p>
          </div>
        )}

        {/* Job Cards */}
        {!isLoading && !isError && availableJobs && availableJobs.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {availableJobs.length} ride{availableJobs.length !== 1 ? "s" : ""}{" "}
              available
            </p>

            {availableJobs.map((job) => (
              <div
                key={job.id}
                id={`job-${job.id}`}
              className="bg-white rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md p-6 transition-all duration-300 shadow-sm"
              >


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-50 p-2 rounded-xl">
                        <Plane className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          {job.airport_pickup_details?.airport || "Airport Pickup"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.airport_pickup_details?.terminal &&
                            `${job.airport_pickup_details.terminal} · `}
                          {job.airport_pickup_details?.pickup_point || "Terminal pickup"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">
                        {job.notes || job.description || "Destination not specified"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                      {job.airport_pickup_details?.arrival_datetime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(
                            job.airport_pickup_details.arrival_datetime
                          ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                      {job.airport_pickup_details?.num_passengers && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {job.airport_pickup_details.num_passengers} pax
                        </span>
                      )}
                      {job.airport_pickup_details?.num_bags && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5" />
                          {job.airport_pickup_details.num_bags} bags
                        </span>
                      )}
                      <span>{timeAgo(job.created_at)}</span>
                    </div>
                  </div>

                  {/* Price + Accept */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-black text-teal-700">
                        {formatCurrency(job.price, job.currency)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">
                        {job.currency}
                      </p>
                    </div>

                    <Button
                      onClick={() => handleClaimJob(job.id)}
                      className={cn(
                        "px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-md",
                        "bg-teal-700 hover:bg-teal-800 text-white",
                        "active:scale-[0.98]"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Accept Ride
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
