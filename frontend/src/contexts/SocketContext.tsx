import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import socketService from '../services/socketService';
import { useSelector } from 'react-redux';
import type { RootState } from '../Redux/store';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connect: (token?: string) => void;
    disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

interface SocketProviderProps {
    children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    const connect = (token: string = '') => {
        const newSocket = socketService.connect(token);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('WebSocket connected successfully');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('WebSocket connection error:', error);
            setIsConnected(false);
        });
    };

    const disconnect = () => {
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
    };

    useEffect(() => {
        if (isAuthenticated) {
            connect();
        } else {
            disconnect();
        }

        return () => {
            // Disconnect on unmount
            if (!isAuthenticated) {
                disconnect();
            }
        };
    }, [isAuthenticated]);

    const value: SocketContextType = {
        socket,
        isConnected,
        connect,
        disconnect,
    };

    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketContext;
