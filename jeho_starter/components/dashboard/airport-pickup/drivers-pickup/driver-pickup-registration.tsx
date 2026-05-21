"use client"

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef } from "react";
import { Upload, FileCheck, X } from "lucide-react";
import { useAuth } from "@/components/contexts/auth-context";


export interface RegistrationData {
  firstName: string;
  lastName: string;
  emergencyContact?: string | undefined;
  nationalIdentityNumber: string;
  licenseNumber: string;
  licensePlateNumber: string;
  licenseStateCountry: string;
  licenseExpirationDate: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColour: string;
  vin?: string | undefined;
  driverLicenseImage: string | File | null;
  frontViewPicture: string | File | null;
  backViewPicture: string | File | null;
  plateNumberFrontViewPicture: string | File | null;
  plateNumberBackViewPicture: string | File | null;
}

interface StepTwoProps {
  data: RegistrationData;
  onUpdate: (field: keyof RegistrationData, value: string | File | null) => void;
}

interface DocumentUploaderProps {
  id: string;
  label: string;
  file: string | File | null;
  onFileSelect: (file: File | null) => void;
}

function DocumentUploader({ label, file, onFileSelect, id }: DocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => inputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileSelect(selectedFile);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </Label>
      
      <div 
        onClick={handleContainerClick}
        className={cn(
          "relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group",
          file 
            ? "border-teal-500 bg-teal-50/30" : "border-gray-200 hover:border-teal-400 hover:bg-gray-50"
        )}
      >
        <input ref={inputRef} id={id} type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} title={label} />

        {file ? (
          <div className="flex flex-col items-center p-2 text-center w-full">
            <FileCheck className="w-8 h-8 text-teal-600 mb-2" />
            <span className="text-xs font-medium text-teal-900 truncate max-w-[90%] px-2">
              {file instanceof File ? file.name : file}
            </span>
            <span className="text-[10px] text-gray-500 mt-1">
              {file instanceof File ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : ''}
            </span>
            <Button variant="ghost" size="sm" onClick={handleRemove} className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full" >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-400 group-hover:text-teal-600 transition-colors">
            <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-teal-100">
               <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Click to upload</span>
            <span className="text-[10px] text-gray-400 mt-1">SVG, PNG, JPG</span>
          </div>
        )}
      </div>
    </div>
  );
}


export function StepTwoRegistration({ data, onUpdate }: StepTwoProps) {
  const { user } = useAuth(); 

  useEffect(() => {
    if (user) {
      if (!data.firstName && user.firstName) onUpdate("firstName", user.firstName);
      if (!data.lastName && user.lastName) onUpdate("lastName", user.lastName);
    }
  }, [user]);

  const handleInput = (key: keyof RegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(key, e.target.value);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
        Driver`s Registration
      </h2>
      <p className="text-center text-gray-500 mb-8 text-sm">
        Fill in your details to get verified and start driving.
      </p>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">1</span>
            <h3 className="font-semibold text-gray-900">Personal Information</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input placeholder="First name" value={data?.firstName} onChange={handleInput("firstName")} className="h-12 bg-gray-50/50" />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input placeholder="Last name" value={data?.lastName} onChange={handleInput("lastName")} className="h-12 bg-gray-50/50" />
            </div>
            <div className="space-y-2">
              <Label>National ID</Label>
              <Input placeholder="ID Number" value={data?.nationalIdentityNumber} onChange={handleInput("nationalIdentityNumber")} className="h-12" />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <Input placeholder="Phone Number" value={data?.emergencyContact} onChange={handleInput("emergencyContact")} className="h-12" />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">2</span>
            <h3 className="font-semibold text-gray-900">Driver License</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>License Number</Label>
                  <Input placeholder="Enter number" value={data?.licenseNumber} onChange={handleInput("licenseNumber")} className="h-12" />
               </div>
               <div className="space-y-2">
                  <Label>Issue State/Country</Label>
                  <Input placeholder="e.g. Lagos" value={data?.licenseStateCountry} onChange={handleInput("licenseStateCountry")} className="h-12" />
               </div>
               <div className="space-y-2 sm:col-span-2">
                  <Label>Expiration Date</Label>
                  <Input type="date" value={data?.licenseExpirationDate} onChange={handleInput("licenseExpirationDate")} className="h-12" />
               </div>
            </div>

            <div className="md:col-span-1">
              <DocumentUploader id="license-upload" label="License Image" file={data?.driverLicenseImage} onFileSelect={(f) => onUpdate("driverLicenseImage", f)} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">3</span>
            <h3 className="font-semibold text-gray-900">Vehicle Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input placeholder="Vehicle Model" value={data?.vehicleModel} onChange={handleInput("vehicleModel")} className="h-12" />
            <Input placeholder="Vehicle Year" value={data?.vehicleYear} onChange={handleInput("vehicleYear")} className="h-12" />
            <Input placeholder="License Plate" value={data?.licensePlateNumber} onChange={handleInput("licensePlateNumber")} className="h-12" />
            <Input placeholder="Vehicle Color" value={data?.vehicleColour} onChange={handleInput("vehicleColour")} className="h-12" />
            <Input placeholder="VIN (Optional)" value={data?.vin} onChange={handleInput("vin")} className="h-12 sm:col-span-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            <DocumentUploader id="vehicle-front" label="Front View" file={data?.frontViewPicture} onFileSelect={(f) => onUpdate("frontViewPicture", f)} />
            <DocumentUploader id="vehicle-back" label="Back View" file={data?.backViewPicture} onFileSelect={(f) => onUpdate("backViewPicture", f)} />
            <DocumentUploader id="vehicle-plate" label="Front Plate" file={data?.plateNumberFrontViewPicture} onFileSelect={(f) => onUpdate("plateNumberFrontViewPicture", f)} />
            <DocumentUploader id="vehicle-plate-back" label="Back Plate" file={data?.plateNumberBackViewPicture} onFileSelect={(f) => onUpdate("plateNumberBackViewPicture", f)} />
          </div>
        </section>

      </div>
    </div>
  )
}
