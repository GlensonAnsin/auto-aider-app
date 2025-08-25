import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SenderReceiverState {
  sender: number | null;
  receiver: number | null;
  role: string | null;
}

const initialState: SenderReceiverState = {
  sender: null,
  receiver: null,
  role: null
};

const senderReceiverSlice = createSlice({
  name: 'senderReceiver',
  initialState,
  reducers: {
    setSenderReceiverState: (state, action: PayloadAction<{ senderID: number, receiverID: number, role: string }>) => {
      state.sender = action.payload.senderID;
      state.receiver = action.payload.receiverID;
      state.role = action.payload.role;
    },
    clearSenderReceiverState: (state) => {
      state.sender = null;
      state.receiver = null;
      state.role = null;
    },
  },
});

export const { setSenderReceiverState, clearSenderReceiverState } = senderReceiverSlice.actions;
export default senderReceiverSlice.reducer;
