"use client";

import LoginHeader from "@/components/loginHeader/Index";

import MenuInternal from "@/components/menuInternal/Index";
import { useTheme } from "@/components/themeProvider/themeContext";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import styles from "./layout.module.scss";
import { signoutThunk } from "@/lib/features/auth";
import { useEffect } from "react";

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navigate = useRouter();
    const dispatch = useAppDispatch();

    const {
        state: { theme },
    } = useTheme();

    const { user, status, selectedMenu, loading, groups } = useAppSelector((state) => state.auth);
    const loadingStore = useAppSelector((state) => state.loading);

    useEffect(() => {
        const loadingToken = loadingStore.effects["auth/verify"] !== "idle";
        const loadingUserDetails = loadingStore.effects["profile/userDetail"] !== "idle";
        const loadingUserGroups = loadingStore.effects["profile/userGroups"] !== "idle";

        if (loadingToken || loadingUserDetails || loadingUserGroups) return;

        if (status === "unauthenticated" || !user.is_active) {
            navigate.push("/");
        }
    }, [status, loadingStore.effects, user.is_active, navigate]);

    const handleSignout = () => {
        dispatch(signoutThunk());
    };

    return (
        <Layout className={styles["container"]}>
            <MenuInternal selectedMenu={selectedMenu} status={status} theme={theme} groups={groups} />
            <Layout>
                <Header className={styles["header"]}>
                    <LoginHeader user={user} status={status} handleSignout={handleSignout} />
                </Header>
                <Content className={styles["content"]}>{children}</Content>
            </Layout>
        </Layout>
    );
}
