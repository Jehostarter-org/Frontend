import StepOneChooseOption from "../airport-pickup";
import StepThreeDetails from "./driver-pickup-details";
import { StepSixRating } from "./driver-pickup-ratings";
import { StepFourNavigation } from "./driver-pickup-navigation";
import { StepTwoRegistration } from "./driver-pickup-registration";
import { StepFiveConfirmation } from "./driver-pickup-confirmation";

import StepSixRiderRating from "../riders-pickup/riders-rating";
import StepFiveArrival from "../riders-pickup/riders-destination";
import StepOneBookPickup from "../riders-pickup/riders-pickup-form";
import StepThreeDirections from "../riders-pickup/riders-direction";
import StepFourDriverArrived from "../riders-pickup/riders-driver-arrival";
import StepTwoVehicleSelection from "../riders-pickup/vehicle-selection";

type UserRole = "driver" | "rider";

interface StepConfig {
  id: string
  component: React.ElementType
  title: string
  progress: number
  stepLabel: string 
  showProgress: boolean
  hasGlobalButton: boolean
}

export const SHARED_STEP: StepConfig = {
  id: "role-selection",
  component: StepOneChooseOption,
  title: "Airport Pickup Form",
  progress: 25,
  stepLabel: "Step 1 of 4",
  showProgress: true,
  hasGlobalButton: true,
}

export const DRIVER_FLOW: StepConfig[] = [
  SHARED_STEP,
  {
    id: "driver-registration",
    component: StepTwoRegistration,
    title: "Airport Pickup Form",
    progress: 50,
    stepLabel: "Step 2 of 4",
    showProgress: true,
    hasGlobalButton: true,
  },
  {
    id: "driver-details",
    component: StepThreeDetails,
    title: "Airport Pickup Form",
    progress: 75,
    stepLabel: "Step 3 of 4",
    showProgress: true,
    hasGlobalButton: true,
  },
  {
    id: "driver-nav",
    component: StepFourNavigation,
    title: "Navigate to Airport",
    progress: 75,
    stepLabel: "",
    showProgress: false,
    hasGlobalButton: true,
  },
  {
    id: "driver-confirm",
    component: StepFiveConfirmation,
    title: "Airport Pickup Form",
    progress: 100,
    stepLabel: "Step 4 of 4",
    showProgress: true,
    hasGlobalButton: true,
  },
  {
    id: "driver-rating",
    component: StepSixRating,
    title: "Rating and feedback",
    progress: 100,
    stepLabel: "",
    showProgress: false,
    hasGlobalButton: true, 
  },
]

export const RIDER_FLOW: StepConfig[] = [
  SHARED_STEP,
  { id: "rider-book", component: StepOneBookPickup, title: "Airport Pickup Form", progress: 25, stepLabel: "Step 1 of 4", showProgress: true, hasGlobalButton: false },
  { id: "rider-vehicle", component: StepTwoVehicleSelection, title: "Airport Pickup Form", progress: 50, stepLabel: "Step 2 of 4", showProgress: true, hasGlobalButton: false },
  { id: "rider-direction", component: StepThreeDirections, title: "Directions", progress: 50, stepLabel: "", showProgress: false, hasGlobalButton: false },
  { id: "rider-arrived", component: StepFourDriverArrived, title: "Driver has arrived", progress: 75, stepLabel: "", showProgress: false, hasGlobalButton: false },
  { id: "rider-dest", component: StepFiveArrival, title: "", progress: 100, stepLabel: "", showProgress: false, hasGlobalButton: false },
  { id: "rider-rating", component: StepSixRiderRating, title: "Rating and feedback", progress: 100, stepLabel: "", showProgress: false, hasGlobalButton: false },
]

export const INITIAL_DATA = {
  selectedOption: "driver" as UserRole,
  firstName: "",
  lastName: "",
  nationalIdentityNumber: "",
  licensePlateNumber: "",
  emergencyContact: "",
  licenseStateCountry: "",
  licenseExpirationDate: "",
  vehicleModel: "",
  vehicleYear: "",
  licenseNumber: "",
  vehicleColour: "",
  vin: "",
  pickupLocation: "",
  availabilitySchedule: "",
  driverLicenseImage: null as File | null,
  frontViewPicture: null as File | null,
  backViewPicture: null as File | null,
  plateNumberFrontViewPicture: null as File | null,
  plateNumberBackViewPicture: null as File | null,

  rideId: "00345",
  passengerName: "Olasupo Emmanuel",
  contactNumber: "+234 701...",
  pickupLocationFinal: "MMA 1 Domestic airport",
  dropoffLocation: "No 33b carrot street...",
  estimatedArrival: "2:00am WST",
  rating: 0,
  feedback: "",
}
