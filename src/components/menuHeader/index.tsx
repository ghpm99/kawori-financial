"use client";
import { Button } from "antd";
import Link from "next/link";

import styles from "./MenuHeader.module.scss";
import { AuthState } from "../providers/auth";

export default function MenuHeader({
    authState,
    isLoading,
    signOut,
}: {
    authState: AuthState;
    isLoading: boolean;
    signOut: () => void;
}) {
    const renderMenu = () => {
        if (isLoading || authState === "unknown") {
            return <></>;
        }

        if (authState !== "authenticated") {
            return (
                <>
                    <Link href={"/signin"} className={styles["button"]}>
                        Logar
                    </Link>
                    <Link href={"/signup"} className={styles["button"]}>
                        Cadastrar
                    </Link>
                </>
            );
        }
        return (
            <>
                <Link href={"/internal/financial"} className={styles["button"]}>
                    Dashboard
                </Link>
                <Button onClick={signOut} className={styles["button"]}>
                    Sair
                </Button>
            </>
        );
    };

    return (
        <div className={styles["menu-header"]}>
            <div className={styles["logo-container"]}>
                <Link href="/" className={styles["logo"]}>
                    Kawori
                </Link>
            </div>
            <div className={styles["user-container"]}>
                <Link href={"/"} className={styles["button"]}>
                    Inicio
                </Link>
                {renderMenu()}
            </div>
        </div>
    );
}
