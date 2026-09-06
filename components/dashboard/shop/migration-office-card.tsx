"use client";

import { Landmark, Phone, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGetImmigrationOfficersQuery } from "@/lib/api/riderApiSlice";

export default function MigrationOfficeCard() {
  const { data: officers = [], isLoading } = useGetImmigrationOfficersQuery(undefined);

  return (
    <Card className="bg-[#2d4a53] text-white overflow-hidden shadow-lg border-none">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-12 w-12 rounded-full bg-teal-500/20 flex items-center justify-center">
            <Landmark className="h-6 w-6 text-teal-300" />
          </div>
          <div>
            <h4 className="font-medium text-base">Migration Office</h4>
            <p className="text-xs text-white/60">Immigration officers near you</p>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-white/70 py-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading officers…
            </div>
          )}

          {!isLoading && officers.length === 0 && (
            <p className="text-xs text-white/70 mb-4 leading-relaxed">
              No immigration officers are available yet.
            </p>
          )}

          {officers.map((officer, index) => (
            <div
              key={officer.id}
              className={`flex items-center justify-between gap-3 rounded-xl bg-white/10 p-3 ${index > 0 ? "mt-3" : ""}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{officer.full_name}</p>
                {officer.city && (
                  <p className="text-[11px] text-white/50">
                    {officer.city}, {officer.country_code}
                  </p>
                )}
              </div>
              <a
                href={`tel:${officer.phone_number}`}
                className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                {officer.phone_number || "—"}
              </a>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}