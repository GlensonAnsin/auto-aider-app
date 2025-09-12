import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoleState {
  role: string | null;
}

const initialState: RoleState = {
  role: null,
};

const RoleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRoleState: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    clearRoleState: (state) => {
      state.role = null;
    },
  },
});

export const { setRoleState, clearRoleState } = RoleSlice.actions;
export default RoleSlice.reducer;
