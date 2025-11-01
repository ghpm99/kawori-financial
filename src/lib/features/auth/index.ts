import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { apiDjango } from "@/services";
import { apiAuth } from "@/services/auth";

import { LOCAL_STORE_ITEM_NAME } from "@/components/constants";
import { MenuItemKey } from "@/components/menuInternal/Index";

export type authStatus = "authenticated" | "unauthenticated";

interface IAuthState {
    user: IUser;
    status: authStatus;
    loading: boolean;
    selectedMenu: MenuItemKey[];
    groups: string[];
}

export interface IUser {
    id: number;
    name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    last_login: string;
    date_joined: string;
    image?: string;
}

interface IUserData {
    id: number;
    name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    last_login: string;
    date_joined: string;
    image?: string;
}

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
    groups: [],
};

export const signinThunk = createAsyncThunk(
    "auth/signin",
    async (args: { username: string; password: string; remember: boolean }) => {
        const response = await apiAuth.post<{ refresh_token_expiration: string }>("token/", args);
        return response.data;
    },
);

export const userDetailThunk = createAsyncThunk("profile/userDetail", async () => {
    const response = await apiDjango.get<IUserData>("profile/");
    return response.data;
});

export const userGroupsThunk = createAsyncThunk("profile/userGroups", async () => {
    const response = await apiDjango.get<{ data: string[] }>("profile/groups/");
    return response.data;
});

export const verifyTokenThunk = createAsyncThunk("auth/verify", async () => {
    const response = await apiAuth.post("token/verify/");
    return response.data;
});

export const refreshTokenThunk = createAsyncThunk("auth/refresh", async () => {
    const response = await apiAuth.post("token/refresh/");
    return response.data;
});

export const signoutThunk = createAsyncThunk("auth/signout", async () => {
    const response = await apiAuth.get("signout");
    return response.data;
});

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        signin: (state) => {
            state.status = "authenticated";
        },
        setLoading: (state: IAuthState, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setSelectedMenu: (state: IAuthState, action: PayloadAction<MenuItemKey[]>) => {
            state.selectedMenu = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signinThunk.fulfilled, (state, action) => {
                state.status = "authenticated";
                localStorage.setItem(LOCAL_STORE_ITEM_NAME, action.payload.refresh_token_expiration);
            })
            .addCase(userDetailThunk.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            .addCase(verifyTokenThunk.fulfilled, (state) => {
                state.status = "authenticated";
                state.loading = false;
            })
            .addCase(refreshTokenThunk.fulfilled, (state) => {
                state.status = "authenticated";
                state.loading = false;
            })
            .addCase(userGroupsThunk.fulfilled, (state, action) => {
                state.groups = action.payload.data;
            })
            .addCase(signoutThunk.fulfilled, (state, action) => {
                state.user = initialState.user;
                state.groups = initialState.groups;
                state.status = "unauthenticated";
                localStorage.removeItem(LOCAL_STORE_ITEM_NAME);
            });
    },
});

export const { signin, setLoading, setSelectedMenu } = authSlice.actions;

export default authSlice.reducer;
