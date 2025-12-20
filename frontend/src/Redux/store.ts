import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/slices/authSlice";
import serviceReducer from "../Redux/slices/serviceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: serviceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
