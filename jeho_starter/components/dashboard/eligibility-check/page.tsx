"use client"

import { useMemo } from "react";
import { MapPin, Home } from "lucide-react";
import { PathwayCard } from "@/components/reuseables/pathwayCard";

type PathwayType = "a" | "b";

interface PathwayOption {
  id: PathwayType;
  title: string;
  description: string;
  icon: typeof MapPin;
  requirementsTitle: string;
  requirements: string[];
}

interface StepOnePathwaySelectionProps {
  onSelectPathway: (pathway: PathwayType) => void;
}

const PATHWAY_OPTIONS: PathwayOption[] = [
  {
    id: "a",
    title: "I'm Already in the Destination Country",
    description: "You are physically present in your destination country and can access full Gold Membership benefits immediately upon approval.",
    icon: MapPin,
    requirementsTitle: "Required:",
    requirements: [
      "Valid visa (minimum 2 years remaining)",
      "2 recent payslips",
      "Bank statement (30-90 days)",
      "Address proof",
      "Phone verification",
    ],
  },
  {
    id: "b",
    title: "I'm Still in My Home Country",
    description: "You will travel soon and can apply for conditional pre-approval. Full benefits unlock once you arrive and complete verification.",
    icon: Home,
    requirementsTitle: "Pre-Eligibility Required:",
    requirements: [
      "Valid passport (2+ years remaining)",
      "Proof of intent to migrate",
      "Destination country & city",
      "Contact information",
    ],
  },
];

export function StepOnePathwaySelection({ onSelectPathway }: StepOnePathwaySelectionProps) {

  const options = useMemo(() => PATHWAY_OPTIONS, []);

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Select Your Current Status</h2>
        <p className="text-gray-600 text-xl">
          Choose whether you are already in your destination country or still in your home country.
        </p>
      </header>

      <div className="space-y-8">
        {options.map((option) => (
          <PathwayCard 
            key={option.id} 
            option={option} 
            onClick={() => onSelectPathway(option.id)} 
          />
        ))}
      </div>

      {/* <div className="space-y-4">
        <button
          onClick={() => onSelectPathway("a")}
          className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-[#2d7a7a] hover:bg-teal-50 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <MapPin className="h-6 w-6 text-[#2d7a7a]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2d7a7a]">
                I'm Already in the Destination Country
              </h3>
              <p className="text-gray-600 mt-1 text-sm">
                You are physically present in your destination country and can access full Gold Membership benefits
                immediately upon approval.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                <p className="font-medium">Required:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Valid visa (minimum 2 years remaining)</li>
                  <li>2 recent payslips</li>
                  <li>Bank statement (30-90 days)</li>
                  <li>Address proof</li>
                  <li>Phone verification</li>
                </ul>
              </div>
            </div>
          </div>
        </button>

        <button
          onClick={() => onSelectPathway("b")}
          className="w-full p-6 border-2 border-gray-200 rounded-lg hover:border-[#2d7a7a] hover:bg-teal-50 transition-all text-left group"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <Home className="h-6 w-6 text-[#2d7a7a]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2d7a7a]">
                I'm Still in My Home Country
              </h3>
              <p className="text-gray-600 mt-1 text-sm">
                You will travel soon and can apply for conditional pre-approval. Full benefits unlock once you arrive
                and complete verification.
              </p>
              <div className="mt-3 text-xs text-gray-500">
                <p className="font-medium">Pre-Eligibility Required:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5">
                  <li>Valid passport (2+ years remaining)</li>
                  <li>Proof of intent to migrate</li>
                  <li>Destination country & city</li>
                  <li>Contact information</li>
                </ul>
              </div>
            </div>
          </div>
        </button>
      </div> */}
    </div>
  )
}
