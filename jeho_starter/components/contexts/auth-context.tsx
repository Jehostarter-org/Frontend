"use client";

import {
  createContext,
  useContext,
  useMemo,
  useEffect,
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

  // Fetch /api/users/me/ whenever a token exists.
  // This keeps the Redux user object fresh after page refresh — without this,
  // user is null until the next login because Redux state doesn't persist.
  const { data: meData, isLoading } = useGetMeQuery(undefined, {
    skip: !token,  // don't call if logged out
  });

  useEffect(() => {
    if (!meData || !token) return;

    // meData is Django snake_case — map to the camelCase shape your UI expects
    dispatch(
      setCredentials({
        token,
        user: {
          id:                 meData.id,
          firstName:          meData.first_name,
          lastName:           meData.last_name,
          username:           meData.username,
          email:              meData.email,
          phone:              meData.phone,
          phoneNumber:        meData.phone,
          bio:                meData.bio,
          avatar:             meData.avatar,
          isVerified:         meData.is_verified,
          birthCountry:       meData.birth_country,
          currentCountry:     meData.current_country,
          destinationCountry: meData.destination_country,
          city:               meData.city,
          migrationStatus:    meData.migration_status,
          plan:               meData.membership_plan,   // used by dashboard-plan.tsx
          currency:           meData.currency,
          acceptedTerms:      meData.accepted_terms,
        },
      })
    );
  }, [meData, token, dispatch]);

  const logout = () => {
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