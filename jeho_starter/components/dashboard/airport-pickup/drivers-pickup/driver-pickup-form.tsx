"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useReducer } from "react";
import { Button } from "@/components/ui/button";
import { DRIVER_FLOW, RIDER_FLOW, INITIAL_DATA } from "./driver-pickup-form-stats";


type UserRole = "driver" | "rider"

interface FormState {
  currentStepIndex: number
  data: typeof INITIAL_DATA
}

type Action =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_ROLE"; payload: UserRole }
  | { type: "UPDATE_DATA"; payload: Partial<typeof INITIAL_DATA> }

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case "UPDATE_DATA":
      return { ...state, data: { ...state.data, ...action.payload } }
    case "SET_ROLE":
      return { ...state, currentStepIndex: 0, data: { ...state.data, selectedOption: action.payload } }
    case "NEXT_STEP":
      return { ...state, currentStepIndex: state.currentStepIndex + 1 }
    case "PREV_STEP":
      return { ...state, currentStepIndex: Math.max(0, state.currentStepIndex - 1) }
    default:
      return state
  }
}

export default function AirportPickupForm() {
  const router = useRouter()
  const [state, dispatch] = useReducer(formReducer, { currentStepIndex: 0, data: INITIAL_DATA })
  const activeFlow = state.data.selectedOption === "driver" ? DRIVER_FLOW : RIDER_FLOW
  const currentStepConfig = activeFlow[state.currentStepIndex] || activeFlow[0]
  const isLastStep = state.currentStepIndex === activeFlow.length - 1
  
  const updateFormData = useCallback((field: keyof typeof INITIAL_DATA, value: typeof INITIAL_DATA[keyof typeof INITIAL_DATA]) => {
    dispatch({ type: "UPDATE_DATA", payload: { [field]: value } })
  }, [])
 
  const handleNext = useCallback(() => {
    if (state.currentStepIndex < activeFlow.length - 1) { dispatch({ type: "NEXT_STEP" }) }
  }, [state.currentStepIndex, activeFlow.length])

  const handleBack = useCallback(() => {
    if (state.currentStepIndex > 0) { dispatch({ type: "PREV_STEP" })
    } else { router.back() }
  }, [state.currentStepIndex, router])

  const handleSubmit = useCallback(() => {
    console.log("[Production] Form submitted:", state.data)
    router.push("/dashboard")
  }, [state.data, router])

  const getComponentProps = () => {
    const commonProps = { onNext: handleNext, onBack: handleBack }
    
    if (currentStepConfig.id === "role-selection") {
      return {
        selectedOption: state.data.selectedOption,
        onSelect: (option: UserRole) => dispatch({ type: "SET_ROLE", payload: option })
      }
    }

    if (currentStepConfig.id === "driver-registration") {
      return { data: state.data, onUpdate: updateFormData }
    }

    if (currentStepConfig.id === "driver-details") {
      return {
        availabilitySchedule: state.data.availabilitySchedule,
        pickupLocation: state.data.pickupLocation,
        onOpenSchedule: () => console.log("Open Schedule"),
        onOpenLocation: () => console.log("Open Location"),
      }
    }

    if (currentStepConfig.id.includes("rating")) {
      return {
        rating: state.data.rating,
        feedback: state.data.feedback,
        onRatingChange: (r: number) => updateFormData("rating", r),
        onFeedbackChange: (f: string) => updateFormData("feedback", f),
        onBack: handleBack 
      }
    }

    return commonProps
  }
  
  const StepComponent = currentStepConfig.component
  
  return (
    <div className="max-w-4xl mx-auto">
      <Button variant="ghost" className="mb-6 -ml-2" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
  
      <div className="bg-white rounded-2xl border border-gray-300 p-8 lg:p-12 shadow-sm">
        {currentStepConfig.title && (
          <h1 className="text-2xl lg:text-3xl font-bold text-center mb-8">
            {currentStepConfig.title}
          </h1>
        )}
  
        {currentStepConfig.showProgress && (
          <div className="mb-6 max-w-md mx-auto">
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div className="bg-[#4a90a4] h-full rounded-full transition-all duration-300"
                style={{ width: `${currentStepConfig.progress}%` }}
              />
              </div>
            {currentStepConfig.stepLabel && (
              <p className="text-center text-sm text-gray-600 mt-3 font-medium">
                {currentStepConfig.stepLabel}
              </p>
            )}
          </div>
        )}
  
  
       <div className="mt-12 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <StepComponent {...getComponentProps()} />
        </div>
  
        {currentStepConfig.hasGlobalButton && (
          <div className="flex justify-center">
            <Button onClick={isLastStep ? handleSubmit : handleNext} className="bg-[#2d7a7a] hover:bg-[#246060] text-white px-16 py-6 text-base font-medium rounded-lg shadow-md transition-all active:scale-[0.98]" >
              {isLastStep ? "Submit" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}