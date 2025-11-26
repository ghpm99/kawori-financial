"use client";

import React from "react";

import { Layout } from "antd";

import MenuHeader from "@/components/menuHeader";
import { useAuth } from "@/components/providers/auth";

import styles from "./landing.module.scss";

const { Footer } = Layout;

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, signOut } = useAuth();

    return (
        <div className={styles["container"]}>
            <MenuHeader isAuthenticated={isAuthenticated} signOut={signOut} />
            <div className={styles["body"]}>
                <div className={styles["internal-page"]}>{children}</div>
            </div>
            <Footer style={{ textAlign: "center", backgroundColor: "transparent", color: "white" }}>
                &copy; 2025 Kawori Financial. All rights reserved.
            </Footer>
        </div>
    );
};

export default LandingLayout;
