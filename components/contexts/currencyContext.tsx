"use client";

import React, {
  createContext, useContext, useState,
  ReactNode, useCallback, useEffect,
} from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken } from "@/lib/features/auth/authSlice";

// ── Types ─────────────────────────────────────────────────────────────────────

type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR" | "GHS" | "KES" | "ZAR" |
                   "INR" | "NPR" | "CNY" | "CAD" | "AUD";

interface LocationInfo {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  countryCode?: string;
}

interface CurrencyContextType {
  currency:     CurrencyCode;
  countryCode:  string | null;
  location:     LocationInfo | null;
  isLoadingLocation: boolean;
  setCurrency:  (code: CurrencyCode) => void;
  formatPrice:  (amount: number, originalCurrency?: string) => string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EXCHANGE_RATES: Record<string, number> = {
  NGN: 1,
  USD: 1550,
  GBP: 1950,
  EUR: 1680,
  GHS: 105,
  KES: 12,
  ZAR: 82,
  INR: 18.5,
  NPR: 11.5,
  CNY: 213,
  CAD: 1140,
  AUD: 1010,
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  NG: "NGN", GH: "GHS", CM: "NGN", KE: "KES", ZA: "ZAR",
  ZW: "USD", UG: "NGN", IN: "INR", NP: "NPR", CN: "CNY",
  GB: "GBP", FR: "EUR", ES: "EUR", PT: "EUR", CY: "EUR",
  US: "USD", CA: "CAD", AU: "AUD",
};

const SUPPORTED      = Object.keys(EXCHANGE_RATES) as CurrencyCode[];
const DEFAULT: CurrencyCode = "NGN";
const API_URL        = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Context ───────────────────────────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const user        = useSelector(selectCurrentUser);
  const token       = useSelector(selectCurrentToken);
  const [currency,    setCurrencyState] = useState<CurrencyCode>(DEFAULT);
  const [countryCode, setCountryCode]   = useState<string | null>(null);
  const [location,    setLocation]      = useState<LocationInfo | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (!user || !token) return;

    // ── Step 1: Use profile country immediately (instant, no network call) ──
    const profileCountry = user.current_country || user.birth_country;
    if (profileCountry) {
      const profileCurrency = COUNTRY_TO_CURRENCY[profileCountry] ?? DEFAULT;
      setCurrencyState(profileCurrency);
      setCountryCode(profileCountry);
    }

    // ── Step 2: Call our own Django backend to detect location via IP ───────
    // This updates PostGIS location and returns the detected country.
    // Falls back silently — profile country is already set above.
    const detectViaIP = async () => {
      setIsLoadingLocation(true);
      try {
        const res = await fetch(`${API_URL}/api/users/location/detect/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        if (data.status === "ok" && data.country_code) {
          const detected = COUNTRY_TO_CURRENCY[data.country_code] ?? DEFAULT;
          setCurrencyState(detected);
          setCountryCode(data.country_code);
          if (typeof data.lat === "number" && typeof data.lng === "number") {
            setLocation({
              latitude: data.lat,
              longitude: data.lng,
              city: data.city,
              region: data.country_code,
              countryCode: data.country_code,
            });
          }
        }
      } catch {
        // Silent fail — profile country already applied above
      }
      finally {
        setIsLoadingLocation(false);
      }
    };

    detectViaIP();
  }, [user?.id, token]); // only re-run when user changes

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (SUPPORTED.includes(code)) setCurrencyState(code);
  }, []);

  const formatPrice = useCallback((amount: number, originalCurrency: string = "NGN") => {
    const safeOriginal = SUPPORTED.includes(originalCurrency as CurrencyCode)
      ? originalCurrency : "NGN";

    const rateFrom        = EXCHANGE_RATES[safeOriginal] ?? 1;
    const rateTo          = EXCHANGE_RATES[currency]     ?? 1;
    const amountInNGN     = amount * rateFrom;
    const convertedAmount = amountInNGN / rateTo;

    try {
      return new Intl.NumberFormat("en-GB", {
        style:                 "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(convertedAmount);
    } catch {
      return `${currency} ${convertedAmount.toFixed(2)}`;
    }
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{
      currency,
      countryCode,
      location,
      isLoadingLocation,
      setCurrency,
      formatPrice,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider.");
  }
  return context;
}
