import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Device } from 'react-native-ble-plx';

interface DeviceState {
  device: Device | null;
}

const initialState: DeviceState = {
  device: null
};

const DeviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceState: (state, action: PayloadAction<Device>) => {
      state.device = action.payload;
    },
    clearDeviceState: (state) => {
      state.device = null;
    },
  },
});

export const { setDeviceState, clearDeviceState } = DeviceSlice.actions;
export default DeviceSlice.reducer;
