import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  mapType: string | null;
  pushNotif: boolean | null;
}

const initialState: SettingsState = {
  mapType: null,
  pushNotif: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettingsState: (state, action: PayloadAction<{ mapType: string; pushNotif: boolean }>) => {
      state.mapType = action.payload.mapType;
      state.pushNotif = action.payload.pushNotif;
    },
    clearSettingsState: (state) => {
      state.mapType = null;
      state.pushNotif = null;
    },
  },
});

export const { setSettingsState, clearSettingsState } = settingsSlice.actions;
export default settingsSlice.reducer;
