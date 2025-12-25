import type { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const setSocketIO = (socketIO: SocketIOServer) => {
    io = socketIO;
};

export const getSocketIO = (): SocketIOServer | null => {
    return io;
};

// Emit booking status update to customer and provider
export const emitBookingStatusUpdate = (
    customerId: number,
    providerId: number,
    booking: any
) => {
    if (!io) {
        console.warn('Socket.IO not initialized');
        return;
    }

    // Emit to customer
    io.to(`user:${customerId}`).emit('booking:statusUpdate', {
        type: 'status_update',
        booking,
        message: `Booking status updated to ${booking.status}`,
    });

    // Emit to provider
    io.to(`user:${providerId}`).emit('booking:statusUpdate', {
        type: 'status_update',
        booking,
        message: `Booking status updated to ${booking.status}`,
    });

    console.log(`Emitted booking:statusUpdate to customer:${customerId} and provider:${providerId}`);
};

// Emit new booking notification to provider
export const emitNewBooking = (providerId: number, booking: any) => {
    if (!io) {
        console.warn('Socket.IO not initialized');
        return;
    }

    io.to(`user:${providerId}`).emit('booking:new', {
        type: 'new_booking',
        booking,
        message: 'You have a new booking request',
    });

    console.log(`Emitted booking:new to provider:${providerId}`);
};

// Emit booking cancellation
export const emitBookingCancelled = (
    customerId: number,
    providerId: number,
    booking: any
) => {
    if (!io) {
        console.warn('Socket.IO not initialized');
        return;
    }

    // Emit to customer
    io.to(`user:${customerId}`).emit('booking:cancelled', {
        type: 'cancelled',
        booking,
        message: 'Booking has been cancelled',
    });

    // Emit to provider
    io.to(`user:${providerId}`).emit('booking:cancelled', {
        type: 'cancelled',
        booking,
        message: 'Booking has been cancelled',
    });

    console.log(`Emitted booking:cancelled to customer:${customerId} and provider:${providerId}`);
};
