"use client";

// components/providers/AuthHydrator.tsx
//
// Dispatches hydrateAuth() ONCE on mount — before any API calls fire.
// This reads the token from localStorage into Redux so prepareHeaders
// can find it in state.auth.token on the very first request.
//
// Usage: wrap your layout children with this INSIDE the Redux Provider:
//
//   <ReduxProvider>
//     <AuthHydrator>
//       {children}
//     </AuthHydrator>
//   </ReduxProvider>

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { hydrateAuth } from "@/lib/features/auth/authSlice";

export default function AuthHydrator({ children }: { children: React.ReactNode }) {
  const dispatch  = useDispatch();
  const hydrated  = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      dispatch(hydrateAuth());   // reads localStorage → Redux state.auth.token
      hydrated.current = true;
    }
  }, [dispatch]);

  return <>{children}</>;
}