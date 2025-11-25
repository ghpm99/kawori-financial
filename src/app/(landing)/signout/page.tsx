"use client";

import { useEffect } from "react";

import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

import LogoKawori from "assets/kaori_logo6.png";

import { useAuth } from "@/components/providers/auth";

import styles from "./signout.module.scss";
import { useTheme } from "@/components/providers/themeProvider/themeContext";

export default function Signout() {
    const navigate = useRouter();
    const { signOut, loading } = useAuth();
    const {
        state: { theme },
    } = useTheme();

    useEffect(() => {
        signOut();
    }, [signOut]);

    useEffect(() => {
        if (loading) return;
        navigate.push("/");
    }, [loading, navigate]);

    const handleToHomeButton = () => {
        navigate.push("/");
    };

    return (
        <div className={styles["container"]}>
            <Image
                alt="Kawori Logo"
                src={LogoKawori}
                className={`${styles["logo-image"]} ${styles[theme]}`}
                width={500}
            />
            <div className={styles["text"]}>Deslogando</div>
            <Button type="primary" onClick={handleToHomeButton}>
                Ir para pagina inicial
            </Button>
        </div>
    );
}
