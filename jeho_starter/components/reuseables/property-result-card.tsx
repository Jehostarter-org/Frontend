import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PropertyResultProps {
  id: string;
  title: string;
  desc: string;
  price: number;
}

export function PropertyResultCard({ id, title, desc, price }: PropertyResultProps) {
  return (
    <Link href={`/dashboard/property-listing/tenants/property-search/${id}`} className="block group">
      <Card className="border-gray-200 transition-all duration-300 hover:border-teal-500 hover:shadow-md cursor-pointer bg-white">
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-teal-700 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="font-bold text-teal-800 text-xl">
              {formatCurrency(price)}
            </p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              Per Month
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}