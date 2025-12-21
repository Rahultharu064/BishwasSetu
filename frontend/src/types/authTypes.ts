export interface AuthState {
  loading: boolean;
  userId: string | null;
  isAuthenticated: boolean;
  profile: UserProfile | null;
}


// types/auth.types.ts (optional but clean)
export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
}


export interface UserProfile {
  id: number;
  email: string;
  name?: string | null;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  isVerified: boolean;
  phone?: string | null;
  createdAt: string;
}

// API contracts
export interface ApiError {
  message?: string;
  errors?: string[];
}

export interface RegisterResponse {
  UserID: string;
}

