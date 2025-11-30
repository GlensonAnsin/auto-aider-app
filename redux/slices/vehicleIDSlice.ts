import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VehicleIDState {
  vehicleID: number | null;
  vehicleName: string | null;
}

const initialState: VehicleIDState = {
  vehicleID: null,
  vehicleName: null,
};

const vehicleIDSlice = createSlice({
  name: 'vehicleID',
  initialState,
  reducers: {
    setVehicleIDState: (state, action: PayloadAction<{ vehicleID: number, vehicleName: string }>) => {
      state.vehicleID = action.payload.vehicleID;
      state.vehicleName = action.payload.vehicleName;
    },
    clearVehicleIDState: (state) => {
      state.vehicleID = null;
      state.vehicleName = null;
    },
  },
});

export const { setVehicleIDState, clearVehicleIDState } = vehicleIDSlice.actions;
export default vehicleIDSlice.reducer;
