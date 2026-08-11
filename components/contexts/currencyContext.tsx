"use client";

import React, {
  createContext, useContext, useState,
  ReactNode, useCallback, useEffect,
} from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectCurrentToken } from "@/lib/features/auth/authSlice";

// ── Types ─────────────────────────────────────────────────────────────────────

type CurrencyCode = "NGN" | "USD" | "GBP" | "EUR" | "GHS" | "KES" | "ZAR" |
                   "XAF" | "UGX" | "INR" | "NPR" | "CNY" | "CAD" | "AUD";

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
  XAF: 2.5,
  UGX: 0.42,
  INR: 18.5,
  NPR: 11.5,
  CNY: 213,
  CAD: 1140,
  AUD: 1010,
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  NG: "NGN", GH: "GHS", CM: "XAF", KE: "KES", ZA: "ZAR",
  ZW: "USD", UG: "UGX", IN: "INR", NP: "NPR", CN: "CNY",
  GB: "GBP", FR: "EUR", ES: "EUR", PT: "EUR", CY: "EUR",
  US: "USD", CA: "CAD", AU: "AUD",
};

export { COUNTRY_TO_CURRENCY };

const SUPPORTED      = Object.keys(EXCHANGE_RATES) as CurrencyCode[];
const DEFAULT: CurrencyCode = "NGN";
const API_URL        = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

// ── Context ───────────────────────────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// ── localStorage helpers (module-level, no React deps) ────────────────────────
const LOCATION_STORAGE_KEY = "jehostarter_currency_location";

function loadSavedLocation(): LocationInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveLocationToStorage(loc: LocationInfo) {
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

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

    // ── Step 2: Check localStorage for a previously saved location ──────
    const saved = loadSavedLocation();
    if (saved && saved.countryCode) {
      const savedCurrency = COUNTRY_TO_CURRENCY[saved.countryCode] ?? DEFAULT;
      setCurrencyState(savedCurrency);
      setCountryCode(saved.countryCode);
      setLocation(saved);
      // Still run browser geolocation in background for fresher data
    }

    // ── Step 3: Try browser geolocation (most accurate) ─────────────────
    const detectViaBrowser = () => {
      if (!navigator.geolocation) {
        detectViaIP();
        return;
      }

      setIsLoadingLocation(true);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              { headers: { "User-Agent": "JehoStarter/1.0" } },
            );
            const data = await res.json();
            const addr = data.address || {};
            const cc = (addr.country_code || "").toUpperCase();

            if (cc) {
              const detected = COUNTRY_TO_CURRENCY[cc] ?? DEFAULT;
              setCurrencyState(detected);
              setCountryCode(cc);
              const cityName = addr.city || addr.town || addr.village || "";
              const locInfo: LocationInfo = {
                latitude,
                longitude,
                city: cityName,
                region: addr.state || "",
                countryCode: cc,
              };
              setLocation(locInfo);
              saveLocationToStorage(locInfo);
              setIsLoadingLocation(false);
              // Persist the detected location + city on the backend user profile
              fetch(`${API_URL}/api/users/location/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  latitude, longitude,
                  country_code: cc,
                  city: cityName,
                  source: "gps",
                }),
              }).catch(() => {});
            } else {
              // No country code from geocoding — fall through to IP detection
              detectViaIP();
            }
          } catch {
            // Geocoding failed — fall through to IP detection
            detectViaIP();
            return;
          }
        },
        () => {
          // User denied GPS — fall through to IP detection
          detectViaIP();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600000 },
      );
    };

    // ── Step 4: IP-based detection (fallback) ───────────────────────────
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
            const locInfo: LocationInfo = {
              latitude: data.lat,
              longitude: data.lng,
              city: data.city,
              region: data.country_code,
              countryCode: data.country_code,
            };
            setLocation(locInfo);
            saveLocationToStorage(locInfo);
          }
        }
      } catch {
        // Silent fail — profile country already applied above
      }
      finally {
        setIsLoadingLocation(false);
      }
    };

    // Start with browser geolocation, which falls back to IP on failure
    detectViaBrowser();
  }, [user?.id, token]); // only re-run when user changes

  const setCurrency = useCallback((code: CurrencyCode) => {
    if (SUPPORTED.includes(code)) setCurrencyState(code);
  }, []);

  const formatPrice = useCallback((amount: number, originalCurrency: string = "NGN") => {
    const safeOriginal = SUPPORTED.includes(originalCurrency as CurrencyCode)
      ? originalCurrency : "NGN";

    const rateFrom = EXCHANGE_RATES[safeOriginal] ?? 1;
    const rateTo   = EXCHANGE_RATES[currency]     ?? 1;
    const amountInNGN = amount * rateFrom;
    const converted   = amountInNGN / rateTo;

    try {
      return new Intl.NumberFormat("en-GB", {
        style:                 "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(converted);
    } catch {
      return `${currency} ${converted.toFixed(2)}`;
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
