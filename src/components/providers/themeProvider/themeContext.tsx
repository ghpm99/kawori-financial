import { createContext, Dispatch, useContext } from "react";

import { Action, ThemeStateType } from ".";

type ThemeContextType = {
    state: ThemeStateType;
    dispatch: Dispatch<Action>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeContextProvider = ThemeContext.Provider;

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
