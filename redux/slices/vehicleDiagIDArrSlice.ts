import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VehicleDiagIDArrState {
    vehicleDiagIDArr: number[] | null;
}

const initialState: VehicleDiagIDArrState = {
    vehicleDiagIDArr: null,
};

const vehicleDiagIDArrSlice = createSlice({
    name: 'vehicleDiagIDArr',
    initialState,
    reducers: {
        setVehicleDiagIDArrState: (state, action: PayloadAction<number[]>) => {
            state.vehicleDiagIDArr = action.payload;
        },
        clearVehicleDiagIDArrState: (state) => {
            state.vehicleDiagIDArr = null;
        }
    },
});

export const { setVehicleDiagIDArrState, clearVehicleDiagIDArrState } = vehicleDiagIDArrSlice.actions;
export default vehicleDiagIDArrSlice.reducer;