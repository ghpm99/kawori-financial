"use client";

import LoginHeader from "@/components/loginHeader/Index";

import MenuInternal from "@/components/menuInternal/Index";
import { useAuth } from "@/components/providers/auth";
import { useUser } from "@/components/providers/user";
import { useTheme } from "@/components/themeProvider/themeContext";
import { useAppSelector } from "@/lib/hooks";
import { Layout } from "antd";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import styles from "./layout.module.scss";

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const navigate = useRouter();

    const { groups, user } = useUser();
    const { isAuthenticated, signOut } = useAuth();

    const {
        state: { theme },
    } = useTheme();

    const { status, selectedMenu } = useAppSelector((state) => state.auth);
    const loadingStore = useAppSelector((state) => state.loading);

    useEffect(() => {
        const loadingToken = loadingStore.effects["auth/verify"] !== "idle";
        const loadingUserDetails = loadingStore.effects["profile/userDetail"] !== "idle";
        const loadingUserGroups = loadingStore.effects["profile/userGroups"] !== "idle";

        if (loadingToken || loadingUserDetails || loadingUserGroups) return;

        if (status === "unauthenticated" || !user?.is_active) {
            navigate.push("/");
        }
    }, [status, loadingStore.effects, user?.is_active, navigate]);

    return (
        <Layout className={styles["container"]}>
            <MenuInternal selectedMenu={selectedMenu} theme={theme} groups={groups} />
            <Layout>
                <Header className={styles["header"]}>
                    <LoginHeader user={user} isAuthenticated={isAuthenticated} handleSignout={signOut} />
                </Header>
                <Content className={styles["content"]}>{children}</Content>
            </Layout>
        </Layout>
    );
}
