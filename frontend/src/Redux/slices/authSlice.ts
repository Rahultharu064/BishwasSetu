import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import * as authService from "../../services/authService";
import type{ AuthState } from "../../types/authTypes.ts";

import type{ RegisterPayload } from "../../types/authTypes.ts";
import axiosapi from "../../services/api";

const initialState: AuthState = {
  loading: false,
  userId: typeof window !== "undefined" ? localStorage.getItem("userId") : null,
  isAuthenticated: false,
};

/* REGISTER */
// In frontend/src/Redux/slices/authSlice.ts
export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authService.registerUser(data);
      toast.success("OTP sent to your email 📩");
      return res.data;
    } catch (err: any) {
      const apiData = err.response?.data;
      const message =
        (Array.isArray(apiData?.errors) && apiData.errors[0]) ||
        apiData?.message ||
        "Registration failed";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);


/* LOGIN */
export const login = createAsyncThunk(
  "auth/login",
  async (data: { identifier: string; password: string }, thunkAPI) => {
    try {
      await authService.loginUser(data);
      toast.success("Login successful");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Login failed");
      return thunkAPI.rejectWithValue(null);
    }
  }
);

/* VERIFY OTP */
export const verifyOTP = createAsyncThunk(
  "auth/verifyOtp",
  async (data: any, thunkAPI) => {
    try {
      await authService.verifyOtp(data);
      toast.success("Login successful");
      return true;
    } catch (err: any) {
      const apiData = err.response?.data;
      const message =
        (Array.isArray(apiData?.errors) && apiData.errors[0]) ||
        apiData?.message ||
        "Invalid OTP";
      toast.error(message);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/* RESEND OTP */
export const resendOTP = createAsyncThunk(
  "auth/resendOtp",
  async (userId: string, { rejectWithValue }) => {
    try {
      await axiosapi.post("/auth/resend-otp", { userId });
      toast.success("OTP resent to your email");
      return true;
    } catch (err: any) {
      const apiData = err.response?.data;
      const message =
        (Array.isArray(apiData?.errors) && apiData.errors[0]) ||
        apiData?.message ||
        "Failed to resend OTP";
      toast.error(message);
      return rejectWithValue(message);
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
        const id = (action.payload as any)?.UserID ?? null;
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
      });
  },
});

export const { logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
