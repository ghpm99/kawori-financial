"use client";
import { sessionGate } from "@/sessionGate";
import * as Sentry from "@sentry/nextjs";
import axios, { AxiosError, AxiosResponse, HttpStatusCode } from "axios";

let isRefreshingToken = false;
let refreshPromise: Promise<unknown> | null = null;

export const apiAuth = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/auth/",
    withCredentials: true,
    headers: {
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_API_URL,
        "Content-Type": "application/json",
    },
});

const responseInterceptor = (response: AxiosResponse) => {
    return response;
};

const errorInterceptor = async (error: AxiosError) => {
    const { config, response } = error;

    if (!response?.status || !config) {
        Sentry.captureException(error);
        return Promise.reject(error);
    }
    const originalRequest = config;

    if (response.status === HttpStatusCode.Unauthorized && sessionGate.isActive()) {
        try {
            await refreshTokenAsync();
            return apiAuth(originalRequest);
        } catch (refreshError) {
            Sentry.captureException(refreshError);
            return Promise.reject(refreshError);
        }
    }

    if (typeof window !== "undefined" && response.status === HttpStatusCode.Forbidden) {
        window.dispatchEvent(new CustomEvent("tokenRefreshFailed"));
    }

    Sentry.captureException(error);
    return Promise.reject(error);
};

apiAuth.interceptors.response.use(responseInterceptor, errorInterceptor);

if (typeof window !== "undefined") {
    apiAuth.get("/csrf/");
}

export const refreshTokenAsync = async () => {
    if (isRefreshingToken) {
        return refreshPromise;
    }

    isRefreshingToken = true;
    refreshPromise = new Promise(async (resolve, reject) => {
        try {
            const refreshResponse = await refreshTokenService();

            if (refreshResponse.status !== 200) {
                reject(new Error("Falha ao atualizar o token"));
            } else {
                resolve(refreshResponse.data);
            }
        } catch (error: unknown) {
            if (
                typeof window !== "undefined" &&
                axios.isAxiosError(error) &&
                error.response?.status === HttpStatusCode.Forbidden
            ) {
                window.dispatchEvent(new CustomEvent("tokenRefreshFailed"));
            }
            reject(error);
        } finally {
            isRefreshingToken = false;
            refreshPromise = null;
        }
    });

    return refreshPromise;
};

export const refreshTokenService = async () => {
    const response = await apiAuth.post<{ msg: string }>("token/refresh/");
    return response;
};

export interface INewUser {
    username: string;
    password: string;
    email: string;
    name: string;
    last_name: string;
}

export const signupService = (user: INewUser) => {
    const response = apiAuth.post<CommonApiResponse>("signup", user);
    return response;
};

export interface ISigninArgs {
    username: string;
    password: string;
    remember: boolean;
}

export interface ISigninResponse {
    refresh_token_expiration: string;
}

export const signinService = (args: ISigninArgs) => {
    const response = apiAuth.post<ISigninResponse>("token/", args);
    return response;
};

export const verifyTokenService = () => {
    const response = apiAuth.post("token/verify/");
    return response;
};

export const signoutService = () => {
    const response = apiAuth.get("signout");
    return response;
};

export interface IPasswordResetRequestArgs {
    email: string;
}

export interface IPasswordResetValidateResponse {
    valid: boolean;
    msg?: string;
}

export interface IPasswordResetConfirmArgs {
    token: string;
    new_password: string;
}

export const requestPasswordResetService = (args: IPasswordResetRequestArgs) =>
    apiAuth.post<{ msg: string }>("password-reset/request/", args);

export const validatePasswordResetTokenService = (token: string) =>
    apiAuth.get<IPasswordResetValidateResponse>(`password-reset/validate/`, { params: { token } });

export const confirmPasswordResetService = (args: IPasswordResetConfirmArgs) =>
    apiAuth.post<{ msg: string | string[] }>("password-reset/confirm/", args);
