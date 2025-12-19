import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import * as authService from "../../services/authService";
import type{ AuthState } from "../../types/authTypes.ts";

const initialState: AuthState = {
  loading: false,
  userId: null,
  isAuthenticated: false,
};

/* REGISTER */
export const register = createAsyncThunk(
  "auth/register",
  async (data: any, thunkAPI) => {
    try {
      const res = await authService.registerUser(data);
      toast.success("OTP sent to email");
      return res.data.UserID;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Register failed");
      return thunkAPI.rejectWithValue(null);
    }
  }
);

/* LOGIN */
export const login = createAsyncThunk(
  "auth/login",
  async (data: any, thunkAPI) => {
    try {
      const res = await authService.loginUser(data);
      toast.success("OTP sent to email");
      return res.data.userId;
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
      toast.error("Invalid OTP");
      return thunkAPI.rejectWithValue(null);
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
        state.userId = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.userId = action.payload;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.isAuthenticated = true;
      });
  },
});

export const { logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
