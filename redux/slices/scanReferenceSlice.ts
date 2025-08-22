import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScanReferenceState {
  scanReference: string | null;
}

const initialState: ScanReferenceState = {
  scanReference: null,
};

const scanReferenceSlice = createSlice({
  name: 'scanRerence',
  initialState,
  reducers: {
    setScanReferenceState: (state, action: PayloadAction<string>) => {
      state.scanReference = action.payload;
    },
    clearScanReferenceState: (state) => {
      state.scanReference = null;
    }
  },
});

export const { setScanReferenceState, clearScanReferenceState } = scanReferenceSlice.actions;
export default scanReferenceSlice.reducer;