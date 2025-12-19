import axiosapi from "./api";



export const registerUser = (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}) => axiosapi.post("/auth/register", data);


export const loginUser = (data: {
  identifier: string;
  password: string;
}) => axiosapi.post("/auth/login", data);


export const verifyOtp = (data: {
  userId: string;
  otp: string;
}) => axiosapi.post("/auth/verify-otp", data);

export const logoutUser = () => axiosapi.post("/auth/logout");