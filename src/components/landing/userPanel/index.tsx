"use client";

import { Button, List, Tabs, TabsProps } from "antd";
import Link from "next/link";

import { authStatus, IUser } from "@/lib/features/auth";

import LoginPage, { ILoginPageProps } from "@/components/signin";
import SingupForm, { ISignupFormProps } from "@/components/signup";

import styles from "./userPanel.module.scss";

const tabItens = ({
    loginPage,
    signupPage,
}: {
    loginPage: ILoginPageProps;
    signupPage: ISignupFormProps;
}): TabsProps["items"] => [
    {
        key: "signup",
        label: "Cadastro",
        children: (
            <div className={styles["form-container"]}>
                <div className={styles["form-title"]} data-testid="cadastro-form">
                    Cadastro
                </div>
                <SingupForm {...signupPage} />
            </div>
        ),
    },
    {
        key: "signin",
        label: "Login",
        children: (
            <div className={styles["form-container"]}>
                <div className={styles["form-title"]}>Login</div>
                <LoginPage {...loginPage} />
            </div>
        ),
    },
];

const UserPanel = ({
    loading,
    user,
    status,
    formatDate,
    handleSignout,
    loginPage,
    signupPage,
}: {
    loading: boolean;
    user: IUser;
    status: authStatus;
    formatDate: (date: string) => string;
    handleSignout: () => void;
    loginPage: ILoginPageProps;
    signupPage: ISignupFormProps;
}) => {
    if (!status || status === "unauthenticated" || !user || loading) {
        return (
            <div className={styles["tabs"]}>
                <Tabs centered items={tabItens({ loginPage: loginPage, signupPage: signupPage })} />
            </div>
        );
    }

    return (
        <div className={styles["user-container"]}>
            <strong className={styles["form-title"]}>Usuario logado</strong>
            <div>
                <div className={styles["user-option"]}>Nome: {user.name}</div>
                <div className={styles["user-option"]}>
                    Data de cadastro: {user.date_joined ? formatDate(user.date_joined) : ""}
                </div>
                <div className={styles["user-option"]}>
                    Ultimo login: {user.last_login ? formatDate(user.last_login) : ""}
                </div>
                <div className={styles["status"]}>
                    <div
                        className={`${styles["status-indicator"]} ${
                            user.is_active ? styles["active"] : styles["inactive"]
                        }`}
                    ></div>
                    <div className={styles["status-text"]}>{user.is_active ? "Ativo" : "Banido"}</div>
                </div>
            </div>
            <div className={styles["access-list"]}>
                <List
                    header={<strong>Acesso Rápido</strong>}
                    bordered
                    dataSource={[
                        { text: "Perfil", link: "/internal/user" },
                        { text: "Facetexture", link: "/internal/facetexture" },
                        { text: "Rank de Classes", link: "/internal/rank" },
                    ]}
                    renderItem={(item) => (
                        <List.Item>
                            <Link href={item.link}>{item.text}</Link>
                        </List.Item>
                    )}
                />
            </div>
            <div>
                <Button
                    type="primary"
                    danger
                    style={{
                        float: "right",
                    }}
                    onClick={handleSignout}
                >
                    Deslogar
                </Button>
            </div>
        </div>
    );
};

export default UserPanel;
