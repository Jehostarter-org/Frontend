"use client";

import { useRef, useState, useEffect } from "react";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/lib/store";
import { hydrateAuth, selectCurrentToken } from "@/lib/features/auth/authSlice";
import { AuthProvider } from "@/components/contexts/auth-context";
import { NotificationProvider } from "@/components/contexts/notification-context";
import { CartProvider } from "@/components/contexts/cart-context";
import { CurrencyProvider } from "@/components/contexts/currencyContext";
import { LocationPermissionBanner } from "@/components/location/LocationPermissionBanner";

// ── Hydrates auth synchronously then gates children until ready ───────────────
// The problem: AuthProvider and NotificationProvider fire API calls on mount.
// If they mount before hydrateAuth() runs, the token isn't in Redux yet
// and every request gets a 401.
// Solution: render children only AFTER hydration is confirmed complete.

function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch  = useDispatch();
  const hydrated  = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hydrated.current) {
      dispatch(hydrateAuth());
      hydrated.current = true;
    }
    // Small timeout ensures Redux has processed the action
    // before any child component fires an API call
    const timer = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(timer);
  }, [dispatch]);

  // Don't render children until hydration is done
  if (!ready) return null;

  return <>{children}</>;
}

// ── Root provider tree ────────────────────────────────────────────────────────
export function Providers({ children }: { children: React.ReactNode }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

  return (
    <ReduxProvider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthHydrator>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <NotificationProvider>
                  {children}
                  <Toaster position="top-right" richColors />
                  <LocationPermissionBanner />
                </NotificationProvider>
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </AuthHydrator>
      </GoogleOAuthProvider>
    </ReduxProvider>
  );
}