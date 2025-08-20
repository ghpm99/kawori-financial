import { Button as ButtonAntd, ButtonProps } from "antd";
import React from "react";

import styles from "./button.module.scss";

const Button = (props: ButtonProps) => {
    return (
        <ButtonAntd
            className={styles["button"]}
            style={{
                background: "var(--color-brand-color-primary-pure)",
                height: "44px",
                borderRadius: "8.58209px",
                padding: "12px 16px",
                fontWeight: "600",
                fontSize: "14px",
                lineHeight: "125%",
                textAlign: "center",
                border: "none",
                color: "var(--color-neutral-color-pure-white)",
            }}
            {...props}
        />
    );
};

export default Button;
