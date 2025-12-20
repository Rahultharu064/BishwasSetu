import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import * as authService from "../../services/authService";
import type{ AuthState } from "../../types/authTypes.ts";
import type{ RegisterPayload ,UserProfile, ApiError, RegisterResponse } from "../../types/authTypes.ts";
import axiosapi from "../../services/api";

const initialState: AuthState = {
  loading: false,
  userId: typeof window !== "undefined" ? localStorage.getItem("userId") : null,
  isAuthenticated: false,
  profile: null,
};

/* REGISTER */
// In frontend/src/Redux/slices/authSlice.ts
export const register = createAsyncThunk<
  RegisterResponse,
  RegisterPayload,
  { rejectValue: string }
>(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const res = await authService.registerUser(data);
      toast.success("OTP sent to your email 📩");
      return res.data as RegisterResponse;
    } catch (err: unknown) {
      const message = isAxiosError<ApiError>(err)
        ? (Array.isArray(err.response?.data?.errors) && err.response?.data?.errors?.[0]) ||
          err.response?.data?.message ||
          "Registration failed"
        : "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);


/* LOGIN */
export const login = createAsyncThunk<
  boolean,
  { identifier: string; password: string },
  { rejectValue: string | null }
>(
  "auth/login",
  async (data, thunkAPI) => {
    try {
      await authService.loginUser(data);
      toast.success("Login successful");
      return true;
    } catch (err: unknown) {
      const message = isAxiosError<ApiError>(err)
        ? err.response?.data?.message || "Login failed"
        : "Login failed";
      toast.error(message);
      return thunkAPI.rejectWithValue(null);
    }
  }
);

/* VERIFY OTP */
export const verifyOTP = createAsyncThunk<
  boolean,
  { userId: string; otp: string },
  { rejectValue: string }
>(
  "auth/verifyOtp",
  async (data, thunkAPI) => {
    try {
      await authService.verifyOtp(data);
      toast.success("Login successful");
      return true;
    } catch (err: unknown) {
      const message = isAxiosError<ApiError>(err)
        ? (Array.isArray(err.response?.data?.errors) && err.response?.data?.errors?.[0]) ||
          err.response?.data?.message ||
          "Invalid OTP"
        : "Invalid OTP";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* RESEND OTP */
export const resendOTP = createAsyncThunk<
  boolean,
  string,
  { rejectValue: string }
>(
  "auth/resendOtp",
  async (userId, { rejectWithValue }) => {
    try {
      await axiosapi.post("/auth/resend-otp", { userId });
      toast.success("OTP resent to your email");
      return true;
    } catch (err: unknown) {
      const message = isAxiosError<ApiError>(err)
        ? (Array.isArray(err.response?.data?.errors) && err.response?.data?.errors?.[0]) ||
          err.response?.data?.message ||
          "Failed to resend OTP"
        : "Failed to resend OTP";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);


// Thunk
export const fetchMe = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>(
  "auth/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.getCurrentUser();
      return data;
    } catch (err: unknown) {
      const msg = isAxiosError<ApiError>(err)
        ? err.response?.data?.message || "Failed to fetch profile"
        : "Failed to fetch profile";
      return rejectWithValue(msg);
    }
  }
);
 

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.userId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload?.UserID ?? null;
        state.userId = id;
        if (id) localStorage.setItem("userId", id);
      })
      .addCase(login.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isAuthenticated = true;
        state.userId = null;
        localStorage.removeItem("userId");
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.profile = action.payload as UserProfile;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.profile = null;
      });
  },
});

export const { logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
