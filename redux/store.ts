import { configureStore } from '@reduxjs/toolkit';
import requestIDReducer from './slices/requestIDSlice';
import routeReducer from './slices/routeSlice';
import scanReducer from './slices/scanSlice';
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
        requestID: requestIDReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;