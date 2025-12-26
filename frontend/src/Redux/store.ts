import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Redux/slices/authSlice";
import socketReducer from "../Redux/slices/socketSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    socket: socketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
