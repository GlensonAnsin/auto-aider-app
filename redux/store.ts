import { configureStore } from '@reduxjs/toolkit';
import scanReducer from './slices/scanSlice';
import tabReducer from './slices/tabBarSlice';
import vehicleDiagIDReducer from './slices/vehicleDiagIDSlice';

export const store = configureStore({
    reducer: {
        scan: scanReducer,
        tab: tabReducer,
        vehicleDiagID: vehicleDiagIDReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;