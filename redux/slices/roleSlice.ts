import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RoleState {
  ID: number | null;
  role: string | null;
}

const initialState: RoleState = {
  ID: null,
  role: null,
};

const roleSlice = createSlice({
  name: 'role',
  initialState,
  reducers: {
    setRoleState: (state, action: PayloadAction<{ ID: number, role: string }>) => {
      state.ID = action.payload.ID;
      state.role = action.payload.role;
    },
    clearRoleState: (state) => {
      state.ID = null;
      state.role = null;
    },
  },
});

export const { setRoleState, clearRoleState } = roleSlice.actions;
export default roleSlice.reducer;
