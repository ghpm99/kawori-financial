import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { fetchNewsFeedData } from "@/app/api/lib/news";

export interface INewsData {
    first_publication_date: string;
    url: string;
    title: string;
}

export type IStatusNews = "waiting" | "loading" | "success" | "error";

interface INewsStore {
    data: INewsData[];
    status: IStatusNews;
}

const initialState: INewsStore = {
    data: [],
    status: "waiting",
};

export const fetchNewsFeedThunk = createAsyncThunk("newsFeed/fetchNewsFeedThunk", async () => {
    const response = await fetchNewsFeedData();

    return response;
});

export const newsFeedSlice = createSlice({
    name: "newsFeed",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchNewsFeedThunk.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchNewsFeedThunk.fulfilled, (state, action) => {
                state.data = action.payload;
                state.status = "success";
            })
            .addCase(fetchNewsFeedThunk.rejected, (state) => {
                state.status = "error";
            });
    },
});

export default newsFeedSlice.reducer;
