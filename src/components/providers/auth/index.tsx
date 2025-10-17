import { LOCAL_STORE_ITEM_NAME } from "@/components/constants";
import { signinService, verifyTokenService } from "@/services/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type AuthContextType = {
    isAuthenticated: boolean;
    loading: boolean;
    signIn: (args: any) => Promise<void>;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useRouter();
    const queryClient = useQueryClient();

    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => verifyLocalStore());

    const { mutateAsync, isPending: isLoging } = useMutation<AxiosResponse<any>, Error, any>({
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
    });

    const { data: verifyTokenData, refetch: refetchVerifyToken } = useQuery({
        queryKey: ["verifyToken"],
        queryFn: verifyTokenService,
        enabled: isAuthenticated,
    });

    const signIn = useCallback(
        async (args: any) => {
            await mutateAsync(args);
        },
        [mutateAsync],
    );

    const signOut = useCallback(() => {
        localStorage.removeItem(LOCAL_STORE_ITEM_NAME);
        setIsAuthenticated(false);
        // navegar para rota de logout / signout
        navigate.push("/signout");
    }, [navigate]);

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
    }, [signOut]);

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
        signIn,
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
