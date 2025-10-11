import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchTagsService } from "@/services/financial";

const initialState: ITagStore = {
    data: [],
    loading: true,
    modal: {
        newTag: {
            visible: false,
            error: false,
            errorMsg: "",
        },
    },
};

export const fetchTags = createAsyncThunk("financial/fetchTags", async () => {
    const response = await fetchTagsService();
    return response;
});

export const financialSlice = createSlice({
    name: "financial",
    initialState,
    reducers: {
        changeVisibleModalTag: (state: ITagStore, action: PayloadAction<PayloadChangeVisibleModalTagsAction>) => {
            state.modal[action.payload.modal].visible = action.payload.visible;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTags.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchTags.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.loading = false;
            });
    },
});

export const { changeVisibleModalTag } = financialSlice.actions;

export default financialSlice.reducer;
