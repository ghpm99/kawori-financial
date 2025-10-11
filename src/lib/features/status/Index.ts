import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cpu: 0,
    memory: 0,
};

export const statusSlice = createSlice({
    name: "status",
    initialState,
    reducers: {
        setCpuAndMemoryValue: (state, action) => {
            state.cpu = action.payload.cpu;
            state.memory = action.payload.memory;
        },
    },
});

export const { setCpuAndMemoryValue } = statusSlice.actions;

export default statusSlice.reducer;
