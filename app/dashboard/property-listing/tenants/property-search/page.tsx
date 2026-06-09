"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/lib/features/auth/authSlice";
import { Button } from "@/components/ui/button";
import DashboardShell from "@/components/dashboard/dashboard-layout";
import { useSearchPropertiesMutation } from "@/lib/api/propertyApiSlice";
import { AlertCircle, ArrowLeft, Building2, SearchX, MapPin } from "lucide-react";
import { TenantSearchData } from "@/components/types/schemas/tenants-scehma";
import { PropertyResultCard } from "@/components/reuseables/property-result-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TenantSearchForm } from "@/components/dashboard/property-listing/tenants/tenants-search-form";
import { Badge } from "@/components/ui/badge";

export default function TenantSearchPage() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);
  const [searchProperties, { data, isLoading: isSearching, isError }] = useSearchPropertiesMutation();
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [searchedCity, setSearchedCity] = useState("");

  const handleSearch = async (searchParams: TenantSearchData) => {
    setSearchInitiated(true);
    setSearchedCity(searchParams.city || "");
    try {
      await searchProperties({
        city: searchParams.city || undefined,
        propertyType: searchParams.propertyType || undefined,
        maxPrice: searchParams.budget || undefined,
        amenities: searchParams.amenities?.length ? searchParams.amenities : undefined,
        duration: searchParams.duration || undefined,
      }).unwrap();
    } catch (err: any) {
      console.error("Search failed:", err);
      // Log the full error shape for debugging
      if (err?.status) console.error("Status:", err.status, "Data:", err.data);
      if (err?.message) console.error("Message:", err.message);
    }
  };

  // Auto-search with user's city once the user is hydrated
  useEffect(() => {
    if (user?.city && !searchInitiated) {
      setSearchInitiated(true);
      setSearchedCity(user.city);
      searchProperties({ city: user.city }).catch((err) =>
        console.error("Auto-search failed:", err)
      );
    }
  }, [user?.city]); // eslint-disable-line react-hooks/exhaustive-deps

  const properties = data?.results ?? [];
  const resultsCount = data?.total ?? 0;

  return (
    <DashboardShell>
      <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
        <div className="py-2">
          <Button variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700 md:-ml-44 transition-colors" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="border-gray-200 shadow-md overflow-hidden border-t-4 border-t-teal-600">
          <CardHeader className="border-b border-gray-100 bg-gray-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Building2 className="h-6 w-6 text-teal-700" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Apartment Search</CardTitle>
                <CardDescription className="text-gray-500">
                  Find your next home in{' '}
                  {user?.city ? (
                    <span className="font-medium text-teal-700">
                      <MapPin className="inline h-3 w-3 mr-0.5" />{user.city}
                    </span>
                  ) : (
                    'your area'
                  )}{' '}
                  based on your preferences and budget
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-8">
            <TenantSearchForm onSearch={handleSearch} isLoading={isSearching} />
          </CardContent>
        </Card>

        {searchInitiated && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 py-20 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Available Properties
                <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                  {isSearching ? "..." : resultsCount}
                </Badge>
                {searchedCity && !isSearching && (
                  <span className="text-sm font-normal text-gray-500">
                    in {searchedCity}
                  </span>
                )}
              </h2>
            </div>

            {isSearching ? (
              <div className="grid gap-4 opacity-60">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 w-full bg-gray-100 animate-pulse rounded-lg border border-gray-200" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-center py-12 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                <p className="text-red-800 font-medium">Search encountered an error. Please try again.</p>
              </div>
            ) : resultsCount > 0 ? (
              <div className="grid gap-4">
                {properties.map((prop: any) => (
                  <PropertyResultCard
                    key={prop.id}
                    id={prop.id}
                    title={prop.property_title || prop.title}
                    desc={`${prop.bedrooms || 0} bed · ${prop.bathrooms || 0} bath · ${(prop.amenities || []).slice(0, 3).join(', ')}`}
                    price={Number(prop.price_amount || prop.price || 0)}
                    city={prop.city}
                    state={prop.state}
                    propertyType={prop.property_type}
                    availableFrom={prop.available_from}
                    images={prop.images}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-sm">
                <SearchX className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
                <p className="text-gray-500 mt-1 max-w-xs mx-auto">
                  We couldn't find any apartments matching your criteria in {searchedCity || 'this area'}. Try adjusting your budget or filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}