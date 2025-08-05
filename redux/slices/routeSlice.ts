import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RouteState {
    route: string[];
}

const initialState: RouteState = {
    route: []
};

const routeSlice = createSlice({
    name: 'route',
    initialState,
    reducers: {
        setRouteState: (state, action: PayloadAction<string>) => {
            state.route.push(action.payload)
        },
        popRouteState: (state) => {
            state.route.pop();
        },
        clearRouteState: (state) => {
            state.route = [];
        }
    },
});

export const { setRouteState, popRouteState, clearRouteState } = routeSlice.actions;
export default routeSlice.reducer;