"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";

type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR";

interface LocationData {
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: typeof window extends undefined ? "NGN" : CurrencyCode) => void;
  formatPrice: (amount: number, originalCurrency?: string) => string;
  location: LocationData | null; 
  isLoadingLocation: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);
const EXCHANGE_RATES: Record<CurrencyCode, number> = { NGN: 1, USD: 1550, GBP: 1950, EUR: 1680 };

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("NGN");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    const detectUserCurrency = async () => {
      const savedLocation = localStorage.getItem("user_location");
      const savedCurrency = localStorage.getItem("user_currency");

      if (savedLocation && savedCurrency) {
        setLocation(JSON.parse(savedLocation));
        setCurrency(savedCurrency as CurrencyCode);
        setIsLoadingLocation(false);
        return; 
      }

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch("https://ipapi.co/json/", { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error("API Limit Reached");

        const data = await response.json();
        const detectedCurrency = data.currency as CurrencyCode;
        const supported: CurrencyCode[] = ["NGN", "USD", "GBP", "EUR"];

        if (supported.includes(detectedCurrency)) {
          setCurrency(detectedCurrency);
          localStorage.setItem("user_currency", detectedCurrency);
        }

        const locData = {
          city: data.city,
          region: data.region,
          country_name: data.country_name,
          latitude: data.latitude,
          longitude: data.longitude,
        };
        
        setLocation(locData);
        localStorage.setItem("user_location", JSON.stringify(locData));

      } catch (error) {
        console.warn("Auto-detection blocked or failed. Defaulting to NGN.");
        setCurrency("NGN");
      } finally {
        setIsLoadingLocation(false); 
      }
    };

    detectUserCurrency();
  }, []);

  const formatPrice = useCallback((amount: number, originalCurrency: string = "NGN") => {
    const safeOriginal = (originalCurrency as CurrencyCode) || "NGN";
    const originalRate = EXCHANGE_RATES[safeOriginal] || 1;
    
    const amountInBase = amount * originalRate;
    const convertedAmount = amountInBase / (EXCHANGE_RATES[currency] || 1);

    return new Intl.NumberFormat('en-GB', { 
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(convertedAmount);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, location, isLoadingLocation }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) throw new Error("useCurrency must be used within a CurrencyProvider.");
  return context;
}