import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import type { Socket } from 'socket.io';
import * as cookie from 'cookie';
import { JWT_SECRET } from './jwt.ts';

interface AuthenticatedSocket extends Socket {
    userId?: number;
    userRole?: string;
}

export const initializeSocket = (httpServer: HTTPServer) => {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: (origin, callback) => {
                if (!origin) return callback(null, true);

                if (
                    origin.startsWith("http://localhost:") ||
                    origin === process.env.FRONTEND_URL
                ) {
                    return callback(null, true);
                }

                return callback(new Error("Not allowed by CORS"));
            },
            credentials: true,
        },
    });

    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
        // Try to get token from handshake auth or cookies
        let token = socket.handshake.auth.token;

        if (!token && socket.handshake.headers.cookie) {
            const cookies = cookie.parse(socket.handshake.headers.cookie);
            token = cookies.token;
        }

        if (!token) {
            console.warn('Socket connection attempt without token');
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET) as {
                id: number;
                role: string;
            };

            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (err) {
            console.error('Socket authentication failed:', err);
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`User connected: ${socket.userId} (${socket.userRole})`);

        // Join user-specific room
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
            console.log(`User ${socket.userId} joined room: user:${socket.userId}`);
        }

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    return io;
};

export default initializeSocket;
