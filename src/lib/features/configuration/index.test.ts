import { configureStore } from "@reduxjs/toolkit";
import configurationReducer, { configurationSlice } from "./index";
import { getAllBdoClass } from "@/services/classification";

describe("configurationSlice", () => {
    test("should handle initial state", () => {
        const initialState = configurationSlice.getInitialState();
        expect(initialState).toEqual({ class: [] });
    });

    test("should handle getAllBdoClass.fulfilled", () => {
        const store = configureStore({
            reducer: {
                configuration: configurationReducer,
            },
        });

        const mockClasses = [
            { id: 1, name: "Warrior" },
            { id: 2, name: "Sorceress" },
        ];
        store.dispatch(getAllBdoClass.fulfilled({ class: mockClasses }, "requestId"));

        const state = store.getState().configuration;
        expect(state.class).toEqual(mockClasses);
    });
});
