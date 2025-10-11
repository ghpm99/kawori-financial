import { userDetailThunk, userGroupsThunk, verifyTokenThunk } from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useCallback, useEffect } from "react";
import { LOCAL_STORE_ITEM_NAME } from "../constants";
import { useRouter } from "next/navigation";

const AuthProvider = ({ children }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { status } = useAppSelector((state) => state.auth);
    const loadingStore = useAppSelector((state) => state.loading);

    const onAuthenticated = useCallback(() => {
        dispatch(userDetailThunk());
        dispatch(userGroupsThunk());
    }, [dispatch]);

    const verifyLocalStore = (): boolean => {
        const localStorageToken = localStorage.getItem(LOCAL_STORE_ITEM_NAME);

        if (!localStorageToken) {
            return false;
        }
        const dateNow = new Date();
        const tokenDate = new Date(localStorageToken);

        return dateNow < tokenDate;
    };

    const loadingAuth = ((): boolean => {
        const verifyTokenLoading = loadingStore.effects["auth/verify"] === "pending";
        const signinLoading = loadingStore.effects["auth/signin"] === "pending";

        return verifyTokenLoading || signinLoading;
    })();

    useEffect(() => {
        if (verifyLocalStore()) {
            dispatch(verifyTokenThunk());
        }
    }, []);

    useEffect(() => {
        const handleTokenRefreshFailed = () => {
            router.push("/signout");
        };

        window.addEventListener("tokenRefreshFailed", handleTokenRefreshFailed);

        return () => {
            window.removeEventListener("tokenRefreshFailed", handleTokenRefreshFailed);
        };
    }, [router]);

    useEffect(() => {
        if (loadingAuth) return;

        if (status === "authenticated") onAuthenticated();
    }, [status, loadingAuth, onAuthenticated, router]);

    return children;
};

export default AuthProvider;
