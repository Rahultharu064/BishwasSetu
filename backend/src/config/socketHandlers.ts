import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const setSocketIO = (socketIO: SocketIOServer) => {
  io = socketIO;
};

export const getSocketIO = (): SocketIOServer | null => {
  return io;
};

function emitToUser(userId: string, event: string, payload: unknown) {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
}

// ── Booking lifecycle ────────────────────────────────────────────

export const emitBookingStatusUpdate = (
  customerId: string,
  providerId: string,
  booking: unknown
) => {
  const payload = { booking };
  emitToUser(customerId, "booking:statusUpdate", payload);
  emitToUser(providerId, "booking:statusUpdate", payload);
};

export const emitNewBooking = (providerId: string, booking: unknown) => {
  emitToUser(providerId, "booking:new", { booking });
};

export const emitBookingCancelled = (
  customerId: string,
  providerId: string,
  booking: unknown
) => {
  const payload = { booking };
  emitToUser(customerId, "booking:cancelled", payload);
  emitToUser(providerId, "booking:cancelled", payload);
};

// ── In-booking chat ───────────────────────────────────────────────

export const emitNewMessage = (
  recipientUserId: string,
  bookingId: string,
  message: { id: string; body: string; senderId: string; createdAt: Date }
) => {
  emitToUser(recipientUserId, "message:new", { bookingId, message });
};
