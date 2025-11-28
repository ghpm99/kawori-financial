"use client";
import React, { useEffect, useReducer } from "react";

import { ConfigProvider, theme } from "antd";
import locale from "antd/lib/locale/pt_BR";

import { antdThemes, Theme } from "@/styles/theme";
import { getSavedTheme } from "@/util";

import { ThemeContextProvider } from "./themeContext";

const { defaultAlgorithm, darkAlgorithm } = theme;

type Status = "loading" | "idle";

export type ThemeStateType = {
    theme: Theme;
    status: Status;
};

export type Action = { type: "CHANGE_THEME"; payload: Theme } | { type: "SET_STATUS"; payload: Status };

const initialState: ThemeStateType = {
    theme: "light",
    status: "loading",
};

const reducer = (state: ThemeStateType, action: Action): ThemeStateType => {
    switch (action.type) {
        case "CHANGE_THEME":
            return {
                ...state,
                theme: action.payload,
            };
        case "SET_STATUS":
            return {
                ...state,
                status: action.payload,
            };
        default:
            return state;
    }
};

const init = (initialState: ThemeStateType): ThemeStateType => {
    const savedTheme = getSavedTheme();
    return {
        ...initialState,
        theme: savedTheme || initialState.theme,
    };
};

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, localDispatch] = useReducer(reducer, initialState, init);

    useEffect(() => {
        if (state.status !== "idle") return;
        localStorage.setItem("theme", state.theme);
        document.documentElement.className = state.theme;
    }, [state.theme, state.status]);

    useEffect(() => {
        localDispatch({ type: "SET_STATUS", payload: "idle" });
    }, []);

    return (
        <ThemeContextProvider value={{ state, dispatch: localDispatch }}>
            <ConfigProvider
                locale={locale}
                theme={{
                    algorithm: state.theme === "dark" ? darkAlgorithm : defaultAlgorithm,
                    ...antdThemes[state.theme],
                }}
            >
                {state.status === "idle" && children}
            </ConfigProvider>
        </ThemeContextProvider>
    );
};

export default ThemeProvider;
