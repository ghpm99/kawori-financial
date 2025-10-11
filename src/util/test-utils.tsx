import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import { PropsWithChildren } from "react";

import { store as storeDefault } from "@/lib/store";

import { Provider } from "react-redux";

// As a basic setup, import your same slice reducers

import { AppStore, RootState } from "@/lib/store";
import { PreloadedStateShapeFromReducersMapObject } from "@reduxjs/toolkit";

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
    preloadedState?: PreloadedStateShapeFromReducersMapObject<RootState>;
    store?: AppStore;
}

export function renderWithProviders(
    ui: React.ReactElement,
    {
        // Automatically create a store instance if no store was passed in
        store = storeDefault(),
        ...renderOptions
    }: ExtendedRenderOptions = {},
) {
    function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
        return <Provider store={store}>{children}</Provider>;
    }

    // Return an object with the store and all of RTL's query functions
    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
