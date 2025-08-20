import { useTheme } from "../themeProvider/themeContext";

const useThemeControl = () => {
    const { state, dispatch } = useTheme();
    const { theme } = state;

    const toggleTheme = () => {
        dispatch({ type: "CHANGE_THEME", payload: theme === "light" ? "dark" : "light" });
    };

    return {
        theme,
        toggleTheme,
    };
};

export default useThemeControl;
