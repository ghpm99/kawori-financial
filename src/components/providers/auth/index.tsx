import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { AxiosError, AxiosResponse } from "axios";
import { useRouter } from "next/navigation";

import {
    INewUser,
    ISigninArgs,
    ISigninResponse,
    signinService,
    signoutService,
    signupService,
    verifyTokenService,
} from "@/services/auth";

import { LOCAL_STORE_ITEM_NAME } from "@/components/constants";

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    errorMessage?: string;
    signIn: (args: ISigninArgs) => Promise<void>;
    signUp: (user: INewUser) => Promise<void>;
    signOut: () => void;
    verify: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const verifyLocalStore = (): boolean => {
    const raw = localStorage.getItem(LOCAL_STORE_ITEM_NAME);
    if (!raw) return false;
    const dateNow = new Date();
    const tokenDate = new Date(raw);
    return dateNow < tokenDate;
};

const messageKey = "auth_message_key";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useRouter();
    const queryClient = useQueryClient();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => verifyLocalStore());
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const { mutateAsync, isPending: isLoging } = useMutation<AxiosResponse<ISigninResponse>, Error, ISigninArgs>({
        mutationFn: signinService,
        onSuccess: (res) => {
            // ajusta conforme o shape do retorno do seu serviço
            console.log("Login successful:", res.data);
            const expiry = res.data?.refresh_token_expiration;
            if (expiry) localStorage.setItem(LOCAL_STORE_ITEM_NAME, expiry);
            setIsAuthenticated(true);
            console.log("Token expiry set to:", expiry);
            queryClient.invalidateQueries({ queryKey: ["verifyToken"] });
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error?.response?.data as { msg: string })?.msg;
            if (errorMessage) {
                setErrorMessage(errorMessage);
                console.error("Login failed:", errorMessage);
            } else {
                setErrorMessage("Falhou ao fazer login.");
            }
            console.error("Login failed:", error);
        },
    });

    const { mutateAsync: mutateSignupAsync, isPending: isLoadingSignup } = useMutation({
        mutationKey: ["signup"],
        mutationFn: signupService,
        onSuccess: (res) => {
            message.success({
                content: res.data.msg,
                key: messageKey,
                duration: 3,
            });
        },
        onError: (error: AxiosError) => {
            const errorMessage = (error?.response?.data as { msg: string })?.msg;
            if (errorMessage) {
                message.error({
                    content: errorMessage,
                    key: messageKey,
                    duration: 3,
                });
                console.error("Signup failed:", errorMessage);
            } else {
                message.error({
                    content: "Falhou ao cadastrar.",
                    key: messageKey,
                    duration: 3,
                });
                console.error("Signup failed:", error);
            }
        },
    });

    const { data: verifyTokenData, refetch: refetchVerifyToken } = useQuery({
        queryKey: ["verifyToken"],
        queryFn: verifyTokenService,
        enabled: isAuthenticated,
    });

    const { mutate: signoutMutate } = useMutation({
        mutationKey: ["signout"],
        mutationFn: signoutService,

        onSuccess: () => {
            localStorage.removeItem(LOCAL_STORE_ITEM_NAME);
            setIsAuthenticated(false);
            navigate.push("/");
            queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });

    const signIn = useCallback(
        async (args: ISigninArgs) => {
            setErrorMessage(undefined);
            await mutateAsync(args);
        },
        [mutateAsync],
    );

    const signUp = useCallback(
        async (user: INewUser) => {
            await mutateSignupAsync(user);
            await mutateAsync({
                username: user.username,
                password: user.password,
                remember: true,
            });
        },
        [mutateAsync, mutateSignupAsync],
    );

    const signOut = useCallback(() => {
        signoutMutate();
    }, [signoutMutate]);

    const verify = useCallback(async (): Promise<boolean> => {
        if (!verifyLocalStore()) {
            signOut();
            return false;
        }
        try {
            refetchVerifyToken();
            setIsAuthenticated(true);
            return true;
        } catch {
            signOut();
            return false;
        }
    }, [refetchVerifyToken, signOut]);

    useEffect(() => {
        // verifica ao montar
        if (verifyLocalStore()) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        const onFail = () => signOut();
        window.addEventListener("tokenRefreshFailed", onFail);
        return () => window.removeEventListener("tokenRefreshFailed", onFail);
    }, [signOut]);

    useEffect(() => {
        if (verifyTokenData && verifyTokenData.data?.msg === "Token válido") {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, [verifyTokenData]);

    const value: AuthContextType = {
        isAuthenticated,
        loading: isLoging,
        errorMessage: errorMessage,
        signIn,
        signUp,
        signOut,
        verify,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

export default AuthProvider;
