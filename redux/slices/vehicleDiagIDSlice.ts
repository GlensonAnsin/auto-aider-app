import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VehicleDiagIDState {
  vehicleDiagID: number | null;
}

const initialState: VehicleDiagIDState = {
  vehicleDiagID: null,
};

const vehicleDiagIDSlice = createSlice({
  name: 'vehicleDiagID',
  initialState,
  reducers: {
    setVehicleDiagIDState: (state, action: PayloadAction<number>) => {
      state.vehicleDiagID = action.payload;
    },
    clearVehicleDiagIDState: (state) => {
      state.vehicleDiagID = null;
    },
  },
});

export const { setVehicleDiagIDState, clearVehicleDiagIDState } = vehicleDiagIDSlice.actions;
export default vehicleDiagIDSlice.reducer;
