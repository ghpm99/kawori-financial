import * as Sentry from '@sentry/react';
import axios, { AxiosError, HttpStatusCode } from 'axios';
import { refreshTokenAsync } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

let tried = 0;
const retryMaxCount = 3;
const retryDelay = 1500;
const statusCodeRetry = [401, 408, 504, 500];

export const apiDjango = axios.create({
    baseURL: apiUrl + '/',
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origin': apiUrl,
        'Content-Type': 'application/json',
    },
});

export const errorInterceptor = async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config;

    if (
        response &&
        statusCodeRetry.includes(response?.status as number) &&
        tried <= retryMaxCount
    ) {
        if (response.status === HttpStatusCode.Unauthorized) {
            try {
                await refreshTokenAsync();
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        tried++;
        return sleepRequest(retryDelay, originalRequest);
    } else {
        Sentry.captureException(error);
        return Promise.reject(error);
    }
};

const sleepRequest = (milliseconds: number, originalRequest: any) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(apiDjango(originalRequest)), milliseconds);
    });
};

apiDjango.interceptors.response.use((response) => response, errorInterceptor);
