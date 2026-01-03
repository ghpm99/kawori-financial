import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { sessionGate } from "@/sessionGate";

export type AuthState = "unknown" | "authenticated" | "unauthenticated";

type AuthContextType = {
    isAuthenticated: boolean;
    authState: AuthState;
    isLoading: boolean;
    errorMessage?: string;
    signIn: (args: ISigninArgs) => Promise<void>;
    signInMessage?: string;
    signUp: (user: INewUser) => Promise<void>;
    signUpMessage?: string;
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
    const [authState, setAuthState] = useState<AuthState>("unknown");

    const {
        data: verifyTokenData,
        isLoading: isVerifying,
        error: verifyError,
        refetch: refetchAuth,
    } = useQuery({
        queryKey: ["auth"],
        queryFn: verifyTokenService,
        enabled: authState === "unknown",
        retry: false,
    });

    useEffect(() => {
        if (verifyTokenData?.data?.msg === "Token válido") {
            setAuthState("authenticated");
        }
    }, [verifyTokenData]);

    useEffect(() => {
        if (verifyError) {
            setAuthState("unauthenticated");
        }
    }, [verifyError]);

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

            refetchAuth();
        },
    });

    const { mutate: logout } = useMutation({
        mutationFn: async () => {
            sessionGate.startInvalidation();
            return signoutService();
        },
        onSuccess: () => {
            sessionGate.invalidate();
            setAuthState("unauthenticated");
            localStorage.removeItem(LOCAL_STORE_ITEM_NAME);
            queryClient.removeQueries({ queryKey: ["auth"] });
            router.push("/");
        },
    });

    const { mutateAsync: signup, error: signupError } = useMutation({
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

    useEffect(() => {
        const handleTokenRefreshFailed = () => {
            logout();
        };

        window.addEventListener("tokenRefreshFailed", handleTokenRefreshFailed);

        return () => {
            window.removeEventListener("tokenRefreshFailed", handleTokenRefreshFailed);
        };
    }, [logout, router]);

    const value: AuthContextType = useMemo(
        () => ({
            authState,
            isAuthenticated,
            isLoading: isVerifying || isLoggingIn,
            errorMessage: getErrorMessage(verifyError),
            signIn: handleSignIn,
            signInMessage: getErrorMessage(loginError),
            signUp: handleSignUp,
            signUpMessage: getErrorMessage(signupError),
            signOut: logout,
            refetchAuth,
        }),
        [
            authState,
            isAuthenticated,
            isVerifying,
            isLoggingIn,
            loginError,
            verifyError,
            signupError,
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
