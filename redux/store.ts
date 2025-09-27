import { configureStore } from '@reduxjs/toolkit';
import deviceReducer from './slices/deviceSlice';
import roleReducer from './slices/roleSlice';
import routeReducer from './slices/routeSlice';
import scanReferenceReducer from './slices/scanReferenceSlice';
import scanReducer from './slices/scanSlice';
import senderReceiverReducer from './slices/senderReceiverSlice';
import tabReducer from './slices/tabBarSlice';
import vehicleDiagIDArrReducer from './slices/vehicleDiagIDArrSlice';
import vehicleDiagIDReducer from './slices/vehicleDiagIDSlice';

export const store = configureStore({
  reducer: {
    scan: scanReducer,
    tab: tabReducer,
    vehicleDiagID: vehicleDiagIDReducer,
    vehicleDiagIDArr: vehicleDiagIDArrReducer,
    route: routeReducer,
    scanReference: scanReferenceReducer,
    senderReceiver: senderReceiverReducer,
    role: roleReducer,
    device: deviceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
