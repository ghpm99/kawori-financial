"use client";

import { Layout } from "antd";

import LoginHeader from "@/components/loginHeader/Index";
import MenuInternal from "@/components/menuInternal/Index";
import { useAuth } from "@/components/providers/auth";
import { useLayout } from "@/components/providers/layout";
import { useUser } from "@/components/providers/user";

import styles from "./layout.module.scss";
import { useTheme } from "@/components/providers/themeProvider/themeContext";

const { Header, Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const { isAuthenticated, signOut } = useAuth();
    const { selectedMenu, menuCollapsed, toggleCollapsed, menuItems } = useLayout();

    const {
        state: { theme },
    } = useTheme();

    return (
        <Layout className={styles["container"]}>
            <MenuInternal
                selectedMenu={selectedMenu}
                theme={theme}
                collapsed={menuCollapsed}
                toggleCollapsed={toggleCollapsed}
                menuItems={menuItems}
            />
            <Layout>
                <Header className={styles["header"]}>
                    <LoginHeader user={user} isAuthenticated={isAuthenticated} handleSignout={signOut} />
                </Header>
                <Content className={styles["content"]}>{children}</Content>
            </Layout>
        </Layout>
    );
}
