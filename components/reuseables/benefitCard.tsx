import { ChevronRight } from "lucide-react";

interface BenefitCardProps {
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  desc: string;
}

export const BenefitCard = ({ color, bgColor, borderColor, title, desc }: BenefitCardProps) => (
  <div
    className={`flex items-start gap-6 p-6 rounded-lg border ${bgColor} ${borderColor}`}
  >
    <div className="shrink-0">
      <ChevronRight size={32} className={color} />
    </div>
    <div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-lg">{desc}</p>
    </div>
  </div>
);
