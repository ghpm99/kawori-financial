import React from "react";

import LandingHeaderClient from "./LandingHeaderClient";

import styles from "./landing.module.scss";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className={styles["container"]}>
            <LandingHeaderClient />
            <div className={styles["body"]}>
                <div className={styles["internal-page"]}>{children}</div>
            </div>
            <footer className={styles["footer"]}>&copy; 2025 Kawori Financial. All rights reserved.</footer>
        </div>
    );
};

export default LandingLayout;
