import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScanState {
  vehicleID: number | null;
  scanReference: string | null;
}

const initialState: ScanState = {
  vehicleID: null,
  scanReference: null,
};

const scanSlice = createSlice({
  name: 'scan',
  initialState,
  reducers: {
    setScanState: (state, action: PayloadAction<{ vehicleID: number; scanReference: string }>) => {
      state.vehicleID = action.payload.vehicleID;
      state.scanReference = action.payload.scanReference;
    },
    clearScanState: (state) => {
      state.vehicleID = null;
      state.scanReference = null;
    },
  },
});

export const { setScanState, clearScanState } = scanSlice.actions;
export default scanSlice.reducer;
