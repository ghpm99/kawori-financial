import TokenService from "@/services/auth/authToken";
import authReducer, { signout, setToken, setLoading, setSelectedMenu, IAuthState, IUser } from "./index";

describe("authSlice", () => {
    describe("setLoading", () => {
        test("should set the loading state", () => {
            const initialState: IAuthState = {
                user: {
                    id: 0,
                    name: "",
                    username: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    is_staff: false,
                    is_active: false,
                    is_superuser: false,
                    last_login: "",
                    date_joined: "",
                },
                status: "unauthenticated",
                loading: true,
                selectedMenu: ["home"],
            };

            const action = setLoading(false);
            const state = authReducer(initialState, action);

            expect(state.loading).toBe(false);
        });
    });

    describe("setSelectedMenu", () => {
        test("should set the selected menu", () => {
            const initialState: IAuthState = {
                user: {
                    id: 0,
                    name: "",
                    username: "",
                    first_name: "",
                    last_name: "",
                    email: "",
                    is_staff: false,
                    is_active: false,
                    is_superuser: false,
                    last_login: "",
                    date_joined: "",
                },
                status: "unauthenticated",
                loading: true,
                selectedMenu: ["home"],
            };

            const action = setSelectedMenu(["profile", "settings"]);
            const state = authReducer(initialState, action);

            expect(state.selectedMenu).toEqual(["profile", "settings"]);
        });
    });
});
