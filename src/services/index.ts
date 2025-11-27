import * as Sentry from "@sentry/nextjs";
import axios, { AxiosError, AxiosResponse, HttpStatusCode } from "axios";
import { refreshTokenAsync } from "./auth";

export const apiDjango = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL + "/",
    withCredentials: true,
    headers: {
        "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_API_URL,
        "Content-Type": "application/json",
    },
});

const responseInterceptor = (response: AxiosResponse) => {
    return response;
};

export const errorInterceptor = async (error: AxiosError) => {
    const { config, response } = error;

    if (!config) {
        return Promise.reject(error);
    }

    if (response?.status === HttpStatusCode.Unauthorized) {
        try {
            await refreshTokenAsync();
        } catch (refreshError) {
            sendEventTokenRefreshFailed();
            return Promise.reject(refreshError);
        }
    }

    Sentry.captureException(error);

    return Promise.reject(error);
};

const sendEventTokenRefreshFailed = () => {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tokenRefreshFailed"));
    }
};

apiDjango.interceptors.response.use(responseInterceptor, errorInterceptor);
