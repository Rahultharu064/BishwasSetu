import axiosapi from "./api";
import type { CreateBookingData, UpdateBookingStatusData, BookingResponse, BookingsResponse, Booking } from "../types/bookingTypes";

export const createBooking = (data: CreateBookingData): Promise<BookingResponse> =>
  axiosapi.post("/bookings", data);

export const getBookingById = (id: number): Promise<{ booking: Booking }> =>
  axiosapi.get(`/bookings/${id}`);

export const getCustomerBookings = (): Promise<BookingsResponse> =>
  axiosapi.get("/bookings/customer/my-bookings");

export const getProviderBookings = (): Promise<BookingsResponse> =>
  axiosapi.get("/bookings/provider/my-bookings");

export const updateBookingStatus = (id: number, data: UpdateBookingStatusData): Promise<BookingResponse> =>
  axiosapi.put(`/bookings/${id}/status`, data);
