"use client"

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface StepSixProps {
  rating: number
  feedback: string
  onRatingChange: (rating: number) => void
  onFeedbackChange: (feedback: string) => void
}

export function StepSixRating({ rating, feedback, onRatingChange, onFeedbackChange }: StepSixProps) {
  return (
    <>
      <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">Rating and feedback</h2>

      <div className="flex justify-center gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button key={star} onClick={() => onRatingChange(star)} className="transition-all hover:scale-110">
            <Star
              className={`h-12 w-12 ${
                star <= rating ? "fill-[#2d7a7a] text-[#2d7a7a]" : "fill-transparent text-gray-400"
              }`}
            />
          </Button>
        ))}
      </div>

      <div>
        <label className="block text-lg font-semibold mb-4">How was your ride?</label>
        <Textarea
          placeholder="Leave a feedback..."
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          className="min-h-[200px] text-base"
        />
      </div>
    </>
  )
}
