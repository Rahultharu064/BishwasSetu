export interface AuthState {
  loading: boolean;
  userId: string | null;
  isAuthenticated: boolean;
}


// types/auth.types.ts (optional but clean)
export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: "CUSTOMER" | "PROVIDER";
}

