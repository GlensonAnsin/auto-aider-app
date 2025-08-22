import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TabState {
  tabVisible: boolean;
}

const initialState: TabState = {
  tabVisible: true,
};

const tabBarSlice = createSlice({
  name: 'tab',
  initialState,
  reducers: {
    setTabState: (state, action: PayloadAction<boolean>) => {
      state.tabVisible = action.payload;
    },
  },
});

export const { setTabState } = tabBarSlice.actions;
export default tabBarSlice.reducer;