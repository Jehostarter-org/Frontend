import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Wallet } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentViewProps {
  onConfirm: () => void;
  onBack: () => void;
  price: number;
  currency: string;
}

export const PaymentView = ({ onConfirm, onBack, price }: PaymentViewProps) => (
  <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-300">
    
    <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-gray-100 hover:bg-gray-200">
            <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-slate-900">Confirm and Pay</h1>
    </div>

    <div className="grid gap-6">
      
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Your Total</h3>
        <div className="flex justify-between items-center text-xl font-bold text-teal-800">
            <span>Total Amount</span>
            <span>{formatCurrency(price)}</span>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Pay with</h3>
        <RadioGroup defaultValue="card">
          
          <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors [&:has([data-state=checked])]:border-teal-600 [&:has([data-state=checked])]:bg-teal-50">
            <RadioGroupItem value="card" id="card" />
            <div className="flex items-center gap-3 flex-1">
                <CreditCard className="w-5 h-5 text-gray-500"/>
                <span className="font-medium text-slate-900">Debit / Credit Card</span>
            </div>
          </label>

          <label className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors [&:has([data-state=checked])]:border-teal-600 [&:has([data-state=checked])]:bg-teal-50 mt-3">
            <RadioGroupItem value="transfer" id="transfer" />
            <div className="flex items-center gap-3 flex-1">
                <Wallet className="w-5 h-5 text-gray-500"/>
                <span className="font-medium text-slate-900">Bank Transfer</span>
            </div>
          </label>

        </RadioGroup>
      </div>

      <Button onClick={onConfirm} size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white text-lg h-14 shadow-lg mt-4">
        Pay {formatCurrency(price)}
      </Button>
    </div>
  </div>
);