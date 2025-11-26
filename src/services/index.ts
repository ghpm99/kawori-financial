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

let tried = 0;
const retryMaxCount = 3;
const retryDelay = 1500;
const statusCodeRetry = [
    HttpStatusCode.Unauthorized,
    HttpStatusCode.RequestTimeout,
    HttpStatusCode.GatewayTimeout,
    HttpStatusCode.InternalServerError,
    HttpStatusCode.ServiceUnavailable,
];

const sleepRequest = (milliseconds: number, originalRequest) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(apiDjango(originalRequest)), milliseconds);
    });
};

const responseInterceptor = (response: AxiosResponse) => {
    return response;
};

export const errorInterceptor = async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config;

    if ((!response || statusCodeRetry.includes(response?.status as number)) && tried <= retryMaxCount) {
        if (response?.status === HttpStatusCode.Unauthorized) {
            try {
                await refreshTokenAsync();
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        tried++;
        return sleepRequest(retryDelay, originalRequest);
    } else {
        if (typeof window !== "undefined" && response?.status === HttpStatusCode.Forbidden) {
            window.dispatchEvent(new CustomEvent("tokenRefreshFailed"));
        }
        Sentry.captureException(error);
        return Promise.reject(error);
    }
};

apiDjango.interceptors.response.use(responseInterceptor, errorInterceptor);
