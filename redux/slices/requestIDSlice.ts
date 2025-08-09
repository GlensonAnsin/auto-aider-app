import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RequestIDState {
    requestID: number | null;
}

const initialState: RequestIDState = {
    requestID: null,
};

const requestIDSlice = createSlice({
    name: 'requestID',
    initialState,
    reducers: {
        setRequestIDState: (state, action: PayloadAction<number>) => {
            state.requestID = action.payload;
        },
        clearRequestIDState: (state) => {
            state.requestID = null;
        }
    },
});

export const { setRequestIDState, clearRequestIDState } = requestIDSlice.actions;
export default requestIDSlice.reducer;