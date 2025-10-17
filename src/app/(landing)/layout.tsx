"use client";

import MenuHeader from "@/components/menuHeader";
import { useAuth } from "@/components/providers/auth";
import { useAppSelector } from "@/lib/hooks";
import { Layout } from "antd";
import React from "react";
import styles from "./landing.module.scss";

const { Footer } = Layout;

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const { status, user } = useAppSelector((state) => state.auth);

    return (
        <div className={styles["container"]}>
            <MenuHeader isAuthenticated={isAuthenticated} user={user} />
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
