"use client";

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectCurrentToken,
  selectIsLoggedIn,
  logOut,
  setCredentials,
} from "@/lib/features/auth/authSlice";
import { useGetMeQuery } from "@/lib/api/authApiSlice";

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: ReturnType<typeof selectCurrentUser>;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  logout: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const dispatch   = useDispatch();
  const user       = useSelector(selectCurrentUser);
  const token      = useSelector(selectCurrentToken);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  // Track the last meData id we dispatched to avoid re-dispatching on every render
  const lastDispatchedId = useRef<string | null>(null);

  const { data: meData, isLoading } = useGetMeQuery(undefined, {
    skip: !token,
    // Only refetch on mount and when token changes — not on every render
    refetchOnMountOrArgChange: false,
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    // Guard: only dispatch if meData is new (different user id)
    if (!meData || !token) return;
    if (lastDispatchedId.current === meData.id) return;

    lastDispatchedId.current = meData.id;

    dispatch(
      setCredentials({
        token,
        user: {
          id:                 meData.id,
          first_name:         meData.first_name,
          firstName:          meData.first_name,
          last_name:          meData.last_name,
          lastName:           meData.last_name,
          username:           meData.username,
          email:              meData.email,
          phone:              meData.phone,
          phoneNumber:        meData.phone,
          bio:                meData.bio,
          avatar:             meData.avatar,
          is_verified:        meData.is_verified,
          isVerified:         meData.is_verified,
          birth_country:      meData.birth_country,
          birthCountry:       meData.birth_country,
          current_country:    meData.current_country,
          currentCountry:     meData.current_country,
          destination_country: meData.destination_country,
          destinationCountry: meData.destination_country,
          state_province:     meData.state_province,
          city:               meData.city,
          migration_status:   meData.migration_status,
          migrationStatus:    meData.migration_status,
          membership_plan:    meData.membership_plan,
          plan:               meData.membership_plan,
          currency:           meData.currency,
          accepted_terms:     meData.accepted_terms,
          acceptedTerms:      meData.accepted_terms,
          created_at:         meData.created_at,
        },
      })
    );
  }, [meData, token, dispatch]);

  const logout = () => {
    lastDispatchedId.current = null;
    dispatch(logOut());
  };

  const value = useMemo(
    () => ({ user, token, isLoggedIn, isLoading, logout }),
    [user, token, isLoggedIn, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
