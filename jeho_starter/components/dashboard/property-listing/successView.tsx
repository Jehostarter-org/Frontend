import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const SuccessView = ({ onHome }: { onHome: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in zoom-in duration-300">
    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
      <Check size={48} className="text-green-600" />
    </div>
    <h1 className="text-4xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
    <p className="text-xl text-gray-600 mb-8 max-w-md">
        Your booking has been confirmed. We have sent the receipt and host contact details to your email.
    </p>
    <div className="flex gap-4">
        <Button onClick={onHome} variant="outline" className="px-8 py-6 text-base">
            Back to Dashboard
        </Button>
        <Button onClick={onHome} className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-6 text-base shadow-md">
            View My Bookings
        </Button>
    </div>
  </div>
);