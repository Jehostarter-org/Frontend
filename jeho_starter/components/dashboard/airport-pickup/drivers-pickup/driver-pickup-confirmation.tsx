"use client"

interface ConfirmationData {
  rideId: string
  passengerName: string
  contactNumber: string
  pickupLocationFinal: string
  dropoffLocation: string
  estimatedArrival: string
}

interface StepFiveProps {
  data: ConfirmationData
}

export function StepFiveConfirmation({ data }: StepFiveProps) {
  return (
    <>
      <h2 className="text-xl font-semibold text-center mb-8">Rider`s information Form</h2>

      <div className="bg-white border border-gray-300 rounded-xl p-6 space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="font-medium text-gray-700">Ride ID</span>
          <span className="font-semibold">{data.rideId}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="font-medium text-gray-700">Passenger`s Name</span>
          <span className="font-semibold">{data.passengerName}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="font-medium text-gray-700">Contact Number</span>
          <span className="font-semibold">{data.contactNumber}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="font-medium text-gray-700">Pickup Location</span>
          <span className="font-semibold text-right">{data.pickupLocationFinal}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-gray-200">
          <span className="font-medium text-gray-700">Drop-off Location</span>
          <span className="font-semibold text-right">{data.dropoffLocation}</span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="font-medium text-gray-700">Time of Arrival</span>
          <span className="font-semibold">{data.estimatedArrival}</span>
        </div>
      </div>
    </>
  )
}
