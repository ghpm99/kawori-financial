import { getAllBdoClass } from "@/services/classification";
import { createSlice } from "@reduxjs/toolkit";

interface IConfigurationState {
    class: IClass[];
}

const initialState: IConfigurationState = {
    class: [],
};

export const configurationSlice = createSlice({
    name: "configuration",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getAllBdoClass.fulfilled, (state, action) => {
            state.class = action.payload.class;
        });
    },
});

export default configurationSlice.reducer;
