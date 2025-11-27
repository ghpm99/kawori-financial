import { createContext, useCallback, useContext, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";

import {
    INewUser,
    ISigninArgs,
    signinService,
    signoutService,
    signupService,
    verifyTokenService,
} from "@/services/auth";

import { LOCAL_STORE_ITEM_NAME } from "@/components/constants";

type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    errorMessage?: string;
    signIn: (args: ISigninArgs) => Promise<void>;
    signUp: (user: INewUser) => Promise<void>;
    signOut: () => void;
    refetchAuth: () => Promise<unknown>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const verifyLocalStore = (): boolean => {
    const raw = localStorage.getItem(LOCAL_STORE_ITEM_NAME);
    if (!raw) return false;
    const dateNow = new Date();
    const tokenDate = new Date(raw);
    return dateNow < tokenDate;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const queryConfig = {
        retry: 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    };

    const {
        data: verifyTokenData,
        isLoading: isVerifying,
        error: verifyError,
        refetch: refetchAuth,
    } = useQuery({
        queryKey: ["auth"],
        queryFn: verifyTokenService,
        enabled: verifyLocalStore(),
        ...queryConfig,
    });

    const isAuthenticated = verifyTokenData?.data?.msg === "Token válido";

    const {
        mutateAsync: login,
        isPending: isLoggingIn,
        error: loginError,
    } = useMutation({
        mutationFn: signinService,
        onSuccess: (res) => {
            const expiry = res.data?.refresh_token_expiration;
            if (expiry) {
                localStorage.setItem(LOCAL_STORE_ITEM_NAME, expiry);
            }

            queryClient.invalidateQueries({ queryKey: ["auth"] });
        },
    });

    const { mutate: logout } = useMutation({
        mutationFn: signoutService,
        onSuccess: () => {
            localStorage.removeItem(LOCAL_STORE_ITEM_NAME);
            queryClient.clear();
            router.push("/login");
        },
    });

    const { mutateAsync: signup } = useMutation({
        mutationFn: signupService,
    });

    const handleSignIn = useCallback(
        async (args: ISigninArgs) => {
            try {
                await login(args);
            } catch (error) {
                const errorMessage = (error as AxiosError<{ msg: string }>)?.response?.data?.msg;
                message.error(errorMessage || "Falha ao fazer login");
                throw error;
            }
        },
        [login],
    );

    const handleSignUp = useCallback(
        async (userData: INewUser) => {
            try {
                await signup(userData);
                await handleSignIn({
                    username: userData.username,
                    password: userData.password,
                    remember: true,
                });
            } catch (error) {
                console.error("Signup failed:", error);
                throw error;
            }
        },
        [signup, handleSignIn],
    );

    const getErrorMessage = (error: unknown): string | undefined => {
        if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as { response?: { data?: { msg?: string } } };
            return axiosError.response?.data?.msg;
        }
        return undefined;
    };

    const value = useMemo(
        () => ({
            isAuthenticated,
            isLoading: isVerifying || isLoggingIn,
            errorMessage: getErrorMessage(loginError) || getErrorMessage(verifyError),
            signIn: handleSignIn,
            signUp: handleSignUp,
            signOut: logout,
            refetchAuth,
        }),
        [
            isAuthenticated,
            isVerifying,
            isLoggingIn,
            loginError,
            verifyError,
            handleSignIn,
            handleSignUp,
            logout,
            refetchAuth,
        ],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
};
