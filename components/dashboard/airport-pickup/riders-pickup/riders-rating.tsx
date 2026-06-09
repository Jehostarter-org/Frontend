"use client";

import { toast } from "sonner";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useSubmitReviewMutation } from "@/lib/api/riderApiSlice";
import { ArrowLeft, Star, MessageSquare, Loader2 } from "lucide-react";

/**
 * Step 6 — Rate your driver.
 *
 * FIX: Calls POST /api/services/<serviceRequestId>/review/
 * with { rating, comment } — matching the ServiceReviewSerializer exactly.
 * serviceRequestId is resolved from prop or sessionStorage.
 */

export interface RatingData {
  rating: number;
  feedback: string;
}

interface StepSixRatingProps {
  onBack?: () => void;
  onSubmitSuccess?: (data: RatingData) => void;
  driverName?: string;
  serviceRequestId?: string;
}

export default function StepSixRating({
  onSubmitSuccess,
  driverName = "your driver",
  serviceRequestId,
}: StepSixRatingProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const [submitReview, { isLoading }] = useSubmitReviewMutation();

  // Resolve the ID — from prop or sessionStorage (set in step 3)
  const resolvedId =
    serviceRequestId ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("activeServiceRequestId") ?? ""
      : "");

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!resolvedId) {
      toast.error("Could not find your trip. Please try again.");
      return;
    }

    try {
      await submitReview({
        serviceId: resolvedId,
        rating,
        comment: feedback,
      }).unwrap();

      // Clean up the stored ID after a successful review
      sessionStorage.removeItem("activeServiceRequestId");

      toast.success("Thank you for your feedback!");
      const data = { rating, feedback };

      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      const errorMsg =
        error?.data?.detail ||
        error?.data?.non_field_errors?.[0] ||
        "Failed to submit review. Please try again.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="py-1">
        <Button
          variant="ghost"
          className="mb-6 md:-ml-60 bg-gray-200 hover:bg-gray-400 text-gray-700"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-10 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Rate your trip</h2>
          <p className="text-gray-500">
            How was your ride with{" "}
            <span className="font-semibold text-gray-800">{driverName}</span>?
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex justify-center gap-2" role="group" aria-label="Star Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="group relative focus:outline-none transition-transform active:scale-95"
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={cn(
                    "w-12 h-12 transition-all duration-200",
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 stroke-yellow-400 scale-110 drop-shadow-sm"
                      : "fill-gray-50 stroke-gray-300 group-hover:stroke-yellow-200"
                  )}
                />
              </button>
            ))}
          </div>
          <p className="h-6 text-sm font-medium text-teal-700 transition-opacity duration-300">
            {rating > 0
              ? getRatingLabel(rating)
              : hoveredRating > 0
                ? getRatingLabel(hoveredRating)
                : ""}
          </p>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Additional Comments (Optional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you liked or what could be improved..."
            rows={5}
            className="w-full p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all placeholder:text-gray-400 text-gray-900"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isLoading || rating === 0}
          className={cn(
            "w-full py-7 text-lg font-semibold rounded-xl shadow-md transition-all",
            "bg-teal-800 hover:bg-teal-900 text-white",
            "disabled:opacity-70 disabled:cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
            </span>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </div>
    </div>
  );
}

function getRatingLabel(star: number) {
  switch (star) {
    case 1: return "Terrible 😞";
    case 2: return "Bad 🙁";
    case 3: return "Okay 😐";
    case 4: return "Good 🙂";
    case 5: return "Excellent! 🤩";
    default: return "";
  }
}