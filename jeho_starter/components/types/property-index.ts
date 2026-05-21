export interface PropertyData {
  // Step 1: Basic Info
  propertyTitle: string;
  propertyType: string;
  rentalType: string;
  description: string;
  address: string;
  nearestLandmark?: string;
  city: string;
  state: string;

  // Step 2: Features & Visuals
  bedrooms: string;
  bathrooms: string;
  kitchen: "Full" | "Kitchenette" | "None";
  furnished: boolean;
  parking: boolean;
  amenities: string[]; // e.g., ["WiFi", "Pool", "Gym"]
  images: File[]; // For handling uploads

  // Step 3: Availability & Terms
  availableFrom: string;
  priceType: string;
  securityDeposit: boolean;
  minStayDuration?: string;
  maxStayDuration?: string;
  houseRules: string[];

  // Pricing
  pricing: {
    amount: number;
    currency: "NGN" | "USD";
    frequency: "monthly" | "yearly";
    securityDeposit: boolean;
  };

  // Step 4: Screening (Optional/Advanced)
  screeningQuestions?: string[];
}


export const INITIAL_DATA: Partial<PropertyData> = {
  propertyTitle: "",
  propertyType: "",
  rentalType: "",
  description: "",
  address: "",
  city: "",
  state: "",
  bedrooms: "",
  bathrooms: "",
  kitchen: "Full",
  furnished: false,
  parking: false,
  amenities: [],
  images: [],
  availableFrom: "",
  priceType: "",
  securityDeposit: false,
  houseRules: [],
  pricing: {
    amount: 0,
    currency: "NGN",
    frequency: "yearly",
    securityDeposit: false,
  },
};
