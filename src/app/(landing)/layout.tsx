"use client";

import MenuHeader from "@/components/menuHeader";
import { useTheme } from "@/components/themeProvider/themeContext";
import { useAppSelector } from "@/lib/hooks";
import { Layout } from "antd";
import React from "react";
import styles from "./landing.module.scss";

const { Footer } = Layout;

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    const {
        state: { theme },
    } = useTheme();
    const { status, user } = useAppSelector((state) => state.auth);

    return (
        <>
            <div className={`${styles["container"]} ${styles[theme]}`}>
                <MenuHeader theme={theme} status={status} user={user} />
                <div className={`${styles["body"]} ${styles[theme]}`}>
                    <div className={styles["internal-page"]}>{children}</div>
                </div>
            </div>
            <Footer style={{ textAlign: "center", boxShadow: "0 0 7px 1px rgba(0,0,0,.1)" }}>
                Sinta-se a vontade para entrar para
                <a target="_blank" href="https://discord.gg/fykNkXyn2r">
                    &nbsp;nossa comunidade&nbsp;
                </a>
                caso tenha alguma duvida ou sugestão!
            </Footer>
        </>
    );
};

export default LandingLayout;
