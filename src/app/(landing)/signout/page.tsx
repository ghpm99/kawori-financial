"use client";

import { useEffect } from "react";

import { Button } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { signoutThunk } from "@/lib/features/auth";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import LogoKawori from "assets/kaori_logo6.png";

import { useAuth } from "@/components/providers/auth";
import { useTheme } from "@/components/themeProvider/themeContext";

import styles from "./signout.module.scss";

export default function Signout() {
    const dispatch = useAppDispatch();
    const navigate = useRouter();
    const { signOut } = useAuth();
    const loadingStore = useAppSelector((state) => state.loading);
    const {
        state: { theme },
    } = useTheme();

    useEffect(() => {
        signOut();
    }, [signOut]);
    const loading = loadingStore.effects["auth/signout"] !== "idle";

    useEffect(() => {
        dispatch(signoutThunk());
    }, [dispatch]);

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
