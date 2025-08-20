"use client";
import Link from "next/link";

import { Menu } from "antd";

import { authStatus, IUser } from "@/lib/features/auth";
import { Theme } from "@/styles/theme";
import ThemeControl from "../themeControl";
import styles from "./MenuHeader.module.scss";

export default function MenuHeader({ status, user, theme }: { status: authStatus; user: IUser; theme: Theme }) {
    const menuItens = [
        {
            label: <Link href={"/"}>Inicio</Link>,
            key: "home",
        },
        {
            label: "Black Desert",
            key: "blackdesert",
            children: [
                {
                    label: <Link href={"/facetexture"}>Facetexture</Link>,
                    key: "facetexture",
                },
                {
                    label: <Link href={"/rank"}>Rank de Classes</Link>,
                    key: "rank",
                },
            ],
        },
        status === "authenticated"
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

    return (
        <div className={`${styles["menu-header"]} ${styles[theme]}`}>
            <div className={styles["logo-container"]}>
                <Link href="/" className={`${styles["logo"]} ${styles[theme]}`}>
                    Kawori
                </Link>
            </div>
            <div className={styles["user-container"]}>
                <ThemeControl />
                <Menu disabledOverflow mode="horizontal" items={menuItens} />
            </div>
        </div>
    );
}
