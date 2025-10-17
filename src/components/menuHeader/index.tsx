"use client";
import Link from "next/link";

import { Menu } from "antd";

import { authStatus, IUser } from "@/lib/features/auth";
import { Theme } from "@/styles/theme";
import ThemeControl from "../themeControl";
import styles from "./MenuHeader.module.scss";

export default function MenuHeader({ isAuthenticated, user }: { isAuthenticated: boolean; user: IUser }) {
    const menuItens = [
        {
            label: <Link href={"/"}>Inicio</Link>,
            key: "home",
        },
        isAuthenticated
            ? {
                  label: user.name,
                  key: "user",
                  children: [
                      {
                          label: <Link href={"/internal/user"}>Conta</Link>,
                          key: "user-account",
                      },
                      {
                          label: <Link href={"/internal/facetexture"}>Facetexture</Link>,
                          key: "user-facetexture",
                      },
                      {
                          label: <Link href={"/internal/rank"}>Rank de Classes</Link>,
                          key: "user-classification",
                      },
                      {
                          label: <div>Sair</div>,
                          key: "user-logout",
                          danger: true,
                      },
                  ],
              }
            : {
                  label: <Link href={"/#login"}>Logar</Link>,
                  key: "login",
              },
    ];

    const renderMenu = () => {
        if (!isAuthenticated) {
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
                <Link href={"/internal/overview"} className={styles["button"]}>
                    Dashboard
                </Link>

                <Link href={"/signout"} className={styles["button"]}>
                    Sair
                </Link>
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
