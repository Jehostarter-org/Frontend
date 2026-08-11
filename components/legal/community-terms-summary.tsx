"use client";

import React, { useState } from "react";
import { FileText, ChevronDown } from "lucide-react";

const TERMS = [
  "Respect members - no bullying, harassment, or stalking",
  "No hate speech, discrimination, or threats",
  "No nudity, sexual content, or exploitation",
  "No spam, scams, or misleading promotions",
  "No impersonation or sharing others' private information",
  "No illegal activity, fraud, or fake opportunities",
  "Jehostarter may remove content and restrict accounts that breach these terms",
];

interface CommunityTermsSummaryProps {
  agreementText: string;
  accent?: "teal" | "blue";
}

export function CommunityTermsSummary({
  agreementText,
  accent = "teal",
}: CommunityTermsSummaryProps) {
  const [open, setOpen] = useState(false);
  const isTeal = accent === "teal";

  return (
    <div
      className={`rounded-2xl border p-3 ${
        isTeal ? "border-teal-100 bg-teal-50/60" : "border-blue-100 bg-blue-50/60"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <span className="flex items-center gap-2">
          <FileText className={`h-3.5 w-3.5 ${isTeal ? "text-teal-900" : "text-blue-600"}`} />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${
              isTeal ? "text-teal-900" : "text-blue-700"
            }`}
          >
            Community Terms & Conditions
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""} ${
            isTeal ? "text-teal-900" : "text-blue-600"
          }`}
        />
      </button>

      {open && (
        <ul className="mt-3 space-y-2">
          {TERMS.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2 text-[11px] font-semibold text-slate-600"
            >
              <span
                className={`mt-[5px] h-1 w-1 rounded-full shrink-0 ${
                  isTeal ? "bg-teal-600" : "bg-blue-600"
                }`}
              />
              {rule}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[10px] font-medium text-slate-500">{agreementText}</p>
    </div>
  );
}
