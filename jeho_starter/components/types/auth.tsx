export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth?: string;
  address?: string;
  gender?: string;
  nationality?: string;
  role?: string;
  plan?: "regular" | "gold";
  picture?: string;
}


export interface AuthResponse extends User{
  token: string;
  message?: string;
  picture?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  gender: string;
  agreeToTerms: boolean;
  superadmin: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  handleAuthResponse(result: AuthResponse): void;
  googleLogin: (token: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}
