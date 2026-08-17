export type PlanType = "regular" | "gold";

export interface PlanFeature {
  id: string;
  text: string;
}

export interface PlanConfig {
  id: PlanType;
  title: string;
  description: string;
  priceLabel: string;
  priceAmount: number; 
  features: string[];
  theme: "light" | "dark";
  highlight?: boolean;
}

export const SUBSCRIPTION_PLANS: PlanConfig[] = [
  {
    id: "regular",
    title: "Regular Package",
    description: "For users already settled or those who prefer a self-guided experience.",
    priceLabel: "Free",
    priceAmount: 0,
    theme: "light",
    features: [
      "Shops Platform (Buy or pay in instalments)",
      "Community Access",
      "Post updates",
      "Basic customer support",
    ],
  },
  {
    id: "gold",
    title: "Gold Package",
    description: "For new migrants needing full, hands-on support for a smooth transition.",
    priceLabel: "$ 25",
    priceAmount: 2500, // This should match your backend expectation
    theme: "dark",
    highlight: true,
    features: [
      "Airport pickup",
      "Temporary housing",
      "Permanent housing help",
      "Priority support",
      "Access to exclusive migration bundles",
    ],
  },
];