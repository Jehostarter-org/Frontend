"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCustomerDetailsQuery } from "@/lib/api/customerDetailsApiSlice";
import { useUpdateCustomerDetailsMutation } from "@/lib/api/customerDetailsApiSlice";

export default function AirportLocationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    airportLocation: "",
    arrivalDate: "",
    arrivalTime: "",
    flightNumber: "",
  });

  const { data: customerData, isLoading } = useCustomerDetailsQuery();
  const [updateCustomerDetails] = useUpdateCustomerDetailsMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCustomerDetails(formData).unwrap();
      router.push("/customer-details/packages");
    } catch (error) {
      console.error("Error updating customer details:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d7a7a]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Airport Location Details</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="airportLocation" className="block text-sm font-medium text-gray-700 mb-2">
              Airport Location
            </label>
            <input
              type="text"
              id="airportLocation"
              name="airportLocation"
              value={formData.airportLocation}
              onChange={handleChange}
              placeholder="Enter airport name and location"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d7a7a]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Date
              </label>
              <input
                type="date"
                id="arrivalDate"
                name="arrivalDate"
                value={formData.arrivalDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d7a7a]"
                required
              />
            </div>

            <div>
              <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Time
              </label>
              <input
                type="time"
                id="arrivalTime"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d7a7a]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="flightNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Flight Number
            </label>
            <input
              type="text"
              id="flightNumber"
              name="flightNumber"
              value={formData.flightNumber}
              onChange={handleChange}
              placeholder="Enter flight number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2d7a7a]"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" className="bg-[#2d7a7a] hover:bg-[#1f5a5a] text-white">
              Continue to Packages
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}