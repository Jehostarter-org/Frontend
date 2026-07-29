import { RootState } from '@/lib/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Matches your Django User model exactly
interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  phoneNumber?: string;
  avatar: string | null;
  picture?: string | null;
  bio: string;
  is_verified: boolean;
  isVerified?: boolean;
  birth_country: string;
  birthCountry?: string;
  current_country: string;
  currentCountry?: string;
  destination_country: string;
  destinationCountry?: string;
  city: string;
  state_province: string;
  stateProvince?: string;
  migration_status: string;
  migrationStatus?: string;
  currency: string;
  membership_plan: 'free' | 'silver' | 'gold';
  plan?: 'free' | 'silver' | 'gold';
  accepted_terms: boolean;
  acceptedTerms?: boolean;
  created_at: string;
  createdAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;           // access token
  refreshToken: string | null;    // refresh token
  _hasHydrated: boolean;
}

const getInitialState = (): AuthState => {
  return {
    user:          null,
    token:         null,
    refreshToken:  null,
    _hasHydrated:  false,
  };
};

const normalizeUser = (user: User): User => ({
  ...user,
  firstName: user.firstName ?? user.first_name,
  lastName: user.lastName ?? user.last_name,
  phoneNumber: user.phoneNumber ?? user.phone,
  picture: user.picture ?? user.avatar,
  isVerified: user.isVerified ?? user.is_verified,
  birthCountry: user.birthCountry ?? user.birth_country,
  currentCountry: user.currentCountry ?? user.current_country,
  destinationCountry: user.destinationCountry ?? user.destination_country,
  stateProvince: user.stateProvince ?? user.state_province,
  migrationStatus: user.migrationStatus ?? user.migration_status,
  plan: user.plan ?? user.membership_plan,
  acceptedTerms: user.acceptedTerms ?? user.accepted_terms,
  createdAt: user.createdAt ?? user.created_at,
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    // Called after successful login or register
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
      }>,
    ) => {
      const { user, token, refreshToken } = action.payload;

      state.user         = normalizeUser(user);
      state.token        = token;
      state.refreshToken = refreshToken ?? null;
      state._hasHydrated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token',  token);
        localStorage.setItem('user',          JSON.stringify(state.user));
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }
        document.cookie = '__session=1; path=/; SameSite=Lax';
      }
    },

    // Called when token is refreshed
    updateToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', action.payload);
      }
    },

    // Called on logout
    logOut: (state) => {
      state.user         = null;
      state.token        = null;
      state.refreshToken = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        document.cookie = '__session=; path=/; SameSite=Lax; Max-Age=0';
        window.location.href = '/auth/login';
      }
    },

    // Re-hydrate from localStorage (called in layout)
    hydrateAuth: (state) => {
      if (typeof window !== 'undefined') {
        try {
          const token        = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');
          const userString   = localStorage.getItem('user');

          if (token && userString) {
            state.token        = token;
            state.refreshToken = refreshToken ?? null;
            state.user         = normalizeUser(JSON.parse(userString));
            document.cookie = '__session=1; path=/; SameSite=Lax';
          }
        } catch (e) {
          console.error('Failed to hydrate auth', e);
        }
      }
      state._hasHydrated = true;
    },
  },
});

export const { setCredentials, updateToken, logOut, hydrateAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectCurrentUser  = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectIsLoggedIn   = (state: RootState) => !!state.auth.token;
export const selectMembershipPlan = (state: RootState) => state.auth.user?.membership_plan ?? 'free';
