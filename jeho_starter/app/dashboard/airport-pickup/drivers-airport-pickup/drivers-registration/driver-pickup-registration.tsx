// app/dashboard/airport-pickup/drivers-airport-pickup/drivers-registration/driver-pickup-registration.tsx

"use client";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import React, { useEffect, useRef, useState } from "react";
import { Upload, FileCheck, X } from "lucide-react";
import { useAuth } from "@/components/contexts/auth-context";

export interface RegistrationData {
    firstName: string;
    lastName: string;
    emergencyContact?: string;
    nationalIdentityNumber: string;
    licenseNumber: string;
    licensePlateNumber: string;
    licenseStateCountry: string;
    licenseExpirationDate: string;
    vehicleModel: string;
    vehicleYear: string;
    vehicleColour: string;
    vin?: string;
    driverLicenseImage: string | File | null;
    frontViewPicture: string | File | null;
    backViewPicture: string | File | null;
    sideViewPicture: string | File | null;
    interiorPicture: string | File | null;
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
    required?: boolean;
}

function DocumentUploader({ label, file, onFileSelect, id, required = false }: DocumentUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file instanceof File) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (typeof file === "string" && file) {
            setPreviewUrl(file);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

    const handleContainerClick = () => inputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Validate file size (max 10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                alert("File too large. Maximum size is 10MB.");
                return;
            }
            // Validate file type
            if (!selectedFile.type.startsWith("image/")) {
                alert("Please upload an image file.");
                return;
            }
            onFileSelect(selectedFile);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFileSelect(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={id} className="text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>

            <div
                onClick={handleContainerClick}
                className={cn(
                    "relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group",
                    file
                        ? "border-teal-500 bg-teal-50/30"
                        : "border-gray-300 hover:border-teal-400 hover:bg-gray-50",
                    previewUrl ? "h-auto min-h-[120px]" : "h-32"
                )}
            >
                <input
                    ref={inputRef}
                    id={id}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {previewUrl ? (
                    <div className="relative w-full p-2">
                        <img
                            src={previewUrl}
                            alt={label}
                            className="max-h-24 max-w-full mx-auto object-contain rounded"
                        />
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <FileCheck className="w-4 h-4 text-teal-600" />
                            <span className="text-xs text-gray-600">
                                {file instanceof File ? file.name : "Uploaded"}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleRemove}
                            className="absolute top-1 right-1 h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600 rounded-full"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-400 group-hover:text-teal-600 transition-colors">
                        <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-teal-100">
                            <Upload className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium">Click to upload</span>
                        <span className="text-[10px] text-gray-400 mt-1">JPG, PNG (max 10MB)</span>
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
    }, [user, data.firstName, data.lastName, onUpdate]);

    const handleInput = (key: keyof RegistrationData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(key, e.target.value);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-gray-900">
                Driver Registration
            </h2>
            <p className="text-center text-gray-500 mb-8 text-sm">
                Fill in your details to get verified and start driving.
            </p>

            <div className="space-y-8">
                {/* Section 1: Personal Information */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">1</span>
                        <h3 className="font-semibold text-gray-900">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="First name"
                                value={data.firstName}
                                onChange={handleInput("firstName")}
                                className="h-12 bg-gray-50/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Last name"
                                value={data.lastName}
                                onChange={handleInput("lastName")}
                                className="h-12 bg-gray-50/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>National ID <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="ID Number"
                                value={data.nationalIdentityNumber}
                                onChange={handleInput("nationalIdentityNumber")}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Emergency Contact</Label>
                            <Input
                                placeholder="Phone Number"
                                value={data.emergencyContact}
                                onChange={handleInput("emergencyContact")}
                                className="h-12"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Driver License */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">2</span>
                        <h3 className="font-semibold text-gray-900">Driver License</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>License Number <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="Enter number"
                                    value={data.licenseNumber}
                                    onChange={handleInput("licenseNumber")}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Issue State/Country <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="e.g. Lagos"
                                    value={data.licenseStateCountry}
                                    onChange={handleInput("licenseStateCountry")}
                                    className="h-12"
                                />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label>Expiration Date <span className="text-red-500">*</span></Label>
                                <Input
                                    type="date"
                                    value={data.licenseExpirationDate}
                                    onChange={handleInput("licenseExpirationDate")}
                                    className="h-12"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <DocumentUploader
                                id="license-upload"
                                label="License Image"
                                file={data.driverLicenseImage}
                                onFileSelect={(f) => onUpdate("driverLicenseImage", f)}
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: Vehicle Details */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">3</span>
                        <h3 className="font-semibold text-gray-900">Vehicle Details</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Vehicle Model <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="e.g. Toyota Camry"
                                value={data.vehicleModel}
                                onChange={handleInput("vehicleModel")}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Vehicle Year <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="e.g. 2020"
                                value={data.vehicleYear}
                                onChange={handleInput("vehicleYear")}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>License Plate <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Plate number"
                                value={data.licensePlateNumber}
                                onChange={handleInput("licensePlateNumber")}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Vehicle Color <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="e.g. Red"
                                value={data.vehicleColour}
                                onChange={handleInput("vehicleColour")}
                                className="h-12"
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label>VIN (Vehicle Identification Number)</Label>
                            <Input
                                placeholder="Optional"
                                value={data.vin}
                                onChange={handleInput("vin")}
                                className="h-12"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        <DocumentUploader
                            id="vehicle-front"
                            label="Front View"
                            file={data.frontViewPicture}
                            onFileSelect={(f) => onUpdate("frontViewPicture", f)}
                        />
                        <DocumentUploader
                            id="vehicle-back"
                            label="Back View"
                            file={data.backViewPicture}
                            onFileSelect={(f) => onUpdate("backViewPicture", f)}
                        />
                        <DocumentUploader
                            id="vehicle-plate"
                            label="Front Plate"
                            file={data.plateNumberFrontViewPicture}
                            onFileSelect={(f) => onUpdate("plateNumberFrontViewPicture", f)}
                        />
                        <DocumentUploader
                            id="vehicle-plate-back"
                            label="Back Plate"
                            file={data.plateNumberBackViewPicture}
                            onFileSelect={(f) => onUpdate("plateNumberBackViewPicture", f)}
                        />
                    </div>
                </section>

                <div className="bg-blue-50 rounded-lg p-4 mt-6">
                    <p className="text-sm text-blue-800">
                        ⚠️ Make sure all documents are clear and legible. Your application will be reviewed by our team.
                    </p>
                </div>
            </div>
        </div>
    );
}