// driver-pickup-form-stats.ts - Complete version

"use client";

// Import all step components
import { StepZeroRoleSelection } from "./driver-pickup-role";
import { StepTwoRegistration, RegistrationData } from "./driver-pickup-registration";
import StepThreeDetails from "./driver-pickup-details";
import { StepFourNavigation } from "./driver-pickup-navigation";
import { StepFiveConfirmation } from "./driver-pickup-confirmation";
import { StepSixRating } from "./driver-pickup-ratings";

// Initial data structure
export const INITIAL_DATA = {
  // Role selection
  selectedOption: null as "driver" | "rider" | null,

  // Step 2 - Registration
  firstName: "",
  lastName: "",
  emergencyContact: "",
  nationalIdentityNumber: "",
  licenseNumber: "",
  licensePlateNumber: "",
  licenseStateCountry: "",
  licenseExpirationDate: "",
  vehicleModel: "",
  vehicleYear: "",
  vehicleColour: "",
  vin: "",
  driverLicenseImage: null as File | null,
  frontViewPicture: null as File | null,
  backViewPicture: null as File | null,
  sideViewPicture: null as File | null,
  interiorPicture: null as File | null,
  plateNumberFrontViewPicture: null as File | null,
  plateNumberBackViewPicture: null as File | null,

  // Step 3 - Details
  availabilitySchedule: "",
  pickupLocation: "",

  // Step 5 - Confirmation (for ride requests)
  rideId: "",
  passengerName: "",
  contactNumber: "",
  pickupLocationFinal: "",
  dropoffLocation: "",
  estimatedArrival: "",

  // Step 6 - Rating
  rating: 0,
  feedback: "",
};

// Driver flow steps
export const DRIVER_FLOW = [
  {
    id: "role-selection",
    title: "Choose Your Role",
    component: StepZeroRoleSelection,
    hasGlobalButton: true,
    showProgress: false,
    progress: 0,
    stepLabel: "",
  },
  {
    id: "driver-registration",
    title: "Become a Driver",
    component: StepTwoRegistration,
    hasGlobalButton: true,
    showProgress: true,
    progress: 33,
    stepLabel: "Step 1 of 3: Registration",
  },
  {
    id: "driver-details",
    title: "Driver's Details",
    component: StepThreeDetails,
    hasGlobalButton: true,
    showProgress: true,
    progress: 66,
    stepLabel: "Step 2 of 3: Schedule & Location",
  },
  {
    id: "driver-confirm",
    title: "Driver's Information",
    component: StepFiveConfirmation,
    hasGlobalButton: true,
    showProgress: true,
    progress: 100,
    stepLabel: "Step 3 of 3: Confirmation",
  },
];

// Rider flow (to be implemented later)
export const RIDER_FLOW = [
  {
    id: "role-selection",
    title: "Choose Your Role",
    component: StepZeroRoleSelection,
    hasGlobalButton: true,
    showProgress: false,
    progress: 0,
    stepLabel: "",
  },
  // Rider steps will be added here
];