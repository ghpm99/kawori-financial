import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { LoadingMiddleware } from "./middleware";
import { RootState } from "@/lib/store";

const initialState: LoadingState = {
    global: false,
    slices: {},
    effects: {},
    requests: {},
};

const loadingSlice = createSlice({
    name: "loading",
    initialState,
    reducers: {
        setLoading: (state, action: PayloadAction<LoadingState>) => {
            return {
                ...state,
                ...action.payload,
            };
        },
    },
});

const setupLoading = createAsyncThunk("loading/setupLoading", async (services: Record<string, any>, thunkApi) => {
    const state = thunkApi.getState() as RootState;
    const loading: LoadingState = {
        ...state.loading,
        global: false,
    };

    const effects: string[] = [];
    Object.keys(services).forEach((item) => {
        if (services[item].typePrefix !== undefined) {
            effects.push(services[item].typePrefix);
        }
    });
    effects.sort();

    for (let i = 0; i < effects.length; i += 1) {
        const effect = effects[i];
        const slice = effect.split("/")[0];

        if (loading.slices[slice] === undefined) {
            loading.slices = { ...loading.slices, [slice]: "starting" };
        }
        if (loading.effects[effect] === undefined) {
            loading.effects = { ...loading.effects, [effect]: "starting" };
        }
        if (loading.requests[effect] === undefined) {
            loading.requests = { ...loading.requests, [effect]: [] };
        }
    }

    thunkApi.dispatch(setLoading(loading));
});

export { LoadingMiddleware, setupLoading };
export const { setLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
