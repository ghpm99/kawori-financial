import * as Sentry from '@sentry/react';
import axios, { AxiosError, HttpStatusCode } from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

let isRefreshingToken = false;
let refreshPromise: Promise<any> | null = null;

export const apiAuth = axios.create({
    baseURL: apiUrl + '/auth/',
    withCredentials: true,
    headers: {
        'Access-Control-Allow-Origin': apiUrl,
        'Content-Type': 'application/json',
    },
});

const errorInterceptor = async (error: AxiosError) => {
    const { config, response } = error;
    const originalRequest = config;

    if (!response?.status) {
        Sentry.captureException(error);
        return Promise.reject(error);
    }

    if (originalRequest && response.status === HttpStatusCode.Unauthorized) {
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

export const refreshTokenAsync = async () => {
    if (isRefreshingToken) {
        return refreshPromise;
    }

    isRefreshingToken = true;
    refreshPromise = new Promise(async (resolve, reject) => {
        try {
            const refreshResponse = await refreshTokenService();

            if (refreshResponse.status !== 200) {
                reject(new Error('Falha ao atualizar o token'));
            } else {
                resolve(refreshResponse.data);
            }
        } catch (error) {
            if ((error as AxiosError)?.status === HttpStatusCode.Forbidden) {
                window.dispatchEvent(new CustomEvent('tokenRefreshFailed'));
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
    const response = await apiAuth.post<{ msg: string }>('token/refresh/');
    return response;
};

apiAuth.interceptors.response.use((response) => response, errorInterceptor);

apiAuth.get('/csrf/');

export interface INewUser {
    username: string;
    password: string;
    email: string;
    name: string;
    last_name: string;
}

export const signupService = (user: INewUser) => {
    const response = apiAuth.post<{ msg: string }>('signup', user);
    return response;
};
