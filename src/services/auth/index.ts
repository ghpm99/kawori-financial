import axios, { AxiosError, AxiosResponse, HttpStatusCode } from "axios";

import * as Sentry from "@sentry/nextjs";

let isRefreshingToken = false;
let refreshPromise: Promise<any> | null = null;

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
    const originalRequest = config;

    if (!response?.status) {
        Sentry.captureException(error);
        return Promise.reject(error);
    }

    if (response.status === HttpStatusCode.Unauthorized) {
        try {
            await refreshTokenAsync();
            return apiAuth(originalRequest);
        } catch (refreshError) {
            Sentry.captureException(refreshError);
            return Promise.reject(refreshError);
        }
    }

    Sentry.captureException(error);
    return Promise.reject(error);
};

apiAuth.interceptors.response.use(responseInterceptor, errorInterceptor);

apiAuth.get("/csrf/");

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
        } catch (error) {
            if (error?.status === HttpStatusCode.Forbidden) {
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
    const response = apiAuth.post<{ msg: string }>("signup", user);
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
