import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SocketState {
    isConnected: boolean;
    lastError: string | null;
}

const initialState: SocketState = {
    isConnected: false,
    lastError: null,
};

const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        setConnected: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
            if (action.payload) {
                state.lastError = null;
            }
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.lastError = action.payload;
            if (action.payload) {
                state.isConnected = false;
            }
        },
    },
});

export const { setConnected, setError } = socketSlice.actions;
export default socketSlice.reducer;
