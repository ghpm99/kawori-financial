"use client";

import LoginHeader from "@/components/loginHeader/Index";

import MenuInternal from "@/components/menuInternal/Index";
import { useTheme } from "@/components/themeProvider/themeContext";
import { signoutThunk } from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import styles from "./layout.module.scss";
import { useEffect } from "react";
import { useAuth } from "@/components/providers/auth";

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const navigate = useRouter();
    const { isAuthenticated } = useAuth();

    const {
        state: { theme },
    } = useTheme();

    const { status, user, selectedMenu, groups } = useAppSelector((state) => state.auth);
    const loadingStore = useAppSelector((state) => state.loading);

    const loading = ((): boolean => {
        const loadingToken = loadingStore.effects["auth/verify"] === "pending";
        const loadingUserDetails = loadingStore.effects["profile/userDetail"] === "pending";
        const loadingUserGroups = loadingStore.effects["profile/userGroups"] !== "idle";

        return loadingToken || loadingUserDetails || loadingUserGroups;
    })();

    useEffect(() => {
        if (loading) return;

        const hasGroups = groups.includes("admin");

        if (status === "unauthenticated" || !user.is_superuser || !hasGroups) {
            navigate.push("/");
        }
    }, [status, loading, user.is_superuser, navigate, groups]);

    const handleSignout = () => {
        dispatch(signoutThunk());
    };

    return (
        <Layout className={styles["container"]}>
            <MenuInternal selectedMenu={selectedMenu} theme={theme} groups={groups} />
            <Layout>
                <Header className={styles["header"]}>
                    <LoginHeader user={user} isAuthenticated={isAuthenticated} handleSignout={handleSignout} />
                </Header>
                <Content className={styles["content"]}>{children}</Content>
            </Layout>
        </Layout>
    );
}
