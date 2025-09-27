import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BluetoothDevice } from 'react-native-bluetooth-classic';

interface DeviceState {
  device: BluetoothDevice | null;
}

const initialState: DeviceState = {
  device: null
};

const DeviceSlice = createSlice({
  name: 'device',
  initialState,
  reducers: {
    setDeviceState: (state, action: PayloadAction<BluetoothDevice>) => {
      state.device = action.payload;
    },
    clearDeviceState: (state) => {
      state.device = null;
    },
  },
});

export const { setDeviceState, clearDeviceState } = DeviceSlice.actions;
export default DeviceSlice.reducer;
