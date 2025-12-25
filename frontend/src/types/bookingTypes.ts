export type BookingStatus = "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Booking {
  id: number;
  customerId: number;
  providerId: number;
  serviceId: number;
  bookingDate: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: number;
    name?: string;
    email: string;
    phone?: string;
    address?: string;
    district?: string;
    municipality?: string;
  };
  provider: {
    id: number;
    user: {
      id: number;
      name?: string;
      email: string;
      phone?: string;
    };
    category?: {
      id: string;
      name: string;
    };
  };
  service: {
    id: number;
    title: string;
    description: string;
    icon?: string;
  };
}

export interface CreateBookingData {
  providerId: number;
  serviceId: number;
  bookingDate: string;
  notes?: string;
}

export interface UpdateBookingStatusData {
  status: BookingStatus;
}

export interface BookingResponse {
  message: string;
  booking: Booking;
}

export interface BookingsResponse {
  bookings: Booking[];
}
