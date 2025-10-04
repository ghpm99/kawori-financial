import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
    signinService,
    verifyTokenService,
    type ISigninArgs,
    type ISigninResponse,
} from '@/services/auth';
import { useMutation, useQuery, type UseMutateFunction } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { LOCAL_STORE_ITEM_NAME } from '../../components/constants';
import type { AxiosResponse } from 'axios';

type AuthContextType = {
    isAuthenticated: boolean;
    verify: () => Promise<void>;
    signOut: () => void;
    lastVerifyData?: unknown;
    signinMutate: UseMutateFunction<
        AxiosResponse<ISigninResponse, any>,
        Error,
        ISigninArgs,
        unknown
    >;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const verifyLocalStore = (): boolean => {
    const localStorageToken = localStorage.getItem(LOCAL_STORE_ITEM_NAME);
    if (!localStorageToken) return false;
    const dateNow = new Date();
    const tokenDate = new Date(localStorageToken);
    return dateNow < tokenDate;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const { data, refetch } = useQuery({
        queryKey: ['verifyToken'],
        queryFn: () => verifyTokenService(),
        enabled: false,
    });

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => verifyLocalStore());

    const verify = useCallback(async () => {
        if (!verifyLocalStore()) {
            setIsAuthenticated(false);
            navigate('/signout');
            return;
        }

        try {
            await refetch();
            setIsAuthenticated(true);
        } catch {
            setIsAuthenticated(false);
            navigate('/signout');
        }
    }, [navigate, refetch]);

    const signOut = useCallback(() => {
        localStorage.removeItem(LOCAL_STORE_ITEM_NAME);
        setIsAuthenticated(false);
        navigate('/signout');
    }, [navigate]);

    useEffect(() => {
        // Verifica ao montar (mantém comportamento parecido com anterior)
        if (verifyLocalStore()) {
            // opcional: podemos tentar refetch aqui, mas manter apenas estado
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        const handleTokenRefreshFailed = () => {
            signOut();
        };

        window.addEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
        return () => {
            window.removeEventListener('tokenRefreshFailed', handleTokenRefreshFailed);
        };
    }, [signOut]);

    const { mutate: signinMutate } = useMutation<
        AxiosResponse<ISigninResponse, any>,
        Error,
        ISigninArgs
    >({
        mutationFn: signinService,
        onSuccess: ({ data }) => {
            localStorage.setItem(LOCAL_STORE_ITEM_NAME, data.refresh_token_expiration);
        },
        onError: (error) => {
            console.error('Login error:', error);
        },
    });

    const value: AuthContextType = {
        isAuthenticated,
        verify,
        signOut,
        lastVerifyData: data,
        signinMutate,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthProvider;
