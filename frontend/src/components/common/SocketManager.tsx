import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../Redux/store';
import { setConnected, setError } from '../../Redux/slices/socketSlice';
import socketService from '../../services/socketService';

const SocketManager = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            const socket = socketService.connect();

            socket.on('connect', () => {
                console.log('WebSocket connected successfully');
                dispatch(setConnected(true));
            });

            socket.on('disconnect', () => {
                console.log('WebSocket disconnected');
                dispatch(setConnected(false));
            });

            socket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
                dispatch(setError(error.message));
            });

            return () => {
                socketService.disconnect();
                dispatch(setConnected(false));
            };
        } else {
            socketService.disconnect();
            dispatch(setConnected(false));
        }
    }, [isAuthenticated, dispatch]);

    return null;
};

export default SocketManager;
