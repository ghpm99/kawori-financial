"use client";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Typography } from "antd";

import LoadingPage from "@/components/loadingPage/Index";
import { useTheme } from "@/components/themeProvider/themeContext";
import { setSelectedMenu } from "@/lib/features/auth";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import styles from "./User.module.scss";
import { useUser } from "@/components/providers/user";

const { Title, Paragraph } = Typography;

const User = () => {
    const navigate = useRouter();
    const dispatch = useAppDispatch();

    const {
        state: { theme },
    } = useTheme();

    const { user, groups } = useUser();

    useEffect(() => {
        document.title = "Kawori Profile";
        dispatch(setSelectedMenu(["user"]));
    }, []);

    const handleSignout = () => {
        navigate.push("/signout");
    };

    const getBorderColor = () => {
        if (groups.includes("admin")) {
            return "blue";
        }
        if (groups.includes("financial")) {
            return "violet";
        }
        if (groups.includes("blackdesert")) {
            return "green";
        }
        if (groups.includes("user")) {
            return "red";
        }

        return "#fff";
    };

    const formatDate = (date: string) => {
        const dateFormat = new Date(date);
        return dateFormat.toLocaleString();
    };

    return (
        <>
            <Breadcrumb
                className={styles["breadcrumb"]}
                items={[{ href: "/", title: "Home" }, { title: "Kawori" }, { title: "Usuário" }]}
            />
            <div className={styles["user-detail-container"]}>
                <Avatar
                    shape="square"
                    size="large"
                    icon={<UserOutlined />}
                    src={user?.image}
                    style={{
                        border: `1px solid ${getBorderColor()}`,
                        marginBottom: "10px",
                        marginTop: "16px",
                        marginLeft: "16px",
                    }}
                />
                <div className={`${styles["title"]} ${styles["title-div"]}`}>Informações gerais</div>
                <div className={`${styles["info-container"]} ${styles[theme]}`}>
                    <div className={styles["info"]}>
                        <Title level={3}>Nome</Title>
                        <Paragraph>{user?.name ?? ""}</Paragraph>
                    </div>
                    <div className={styles["info"]}>
                        <Title level={3}>Username</Title>
                        <div>{user?.username ?? ""}</div>
                    </div>
                    <div className={styles["info"]}>
                        <Title level={3}>Status</Title>
                        <div className={styles["status"]}>
                            <div className={styles["status-indicator"]}></div>
                            <div className={styles["status-text"]}>Ativo</div>
                        </div>
                    </div>
                </div>
                <div className={`${styles["info-container"]} ${styles[theme]}`}>
                    <div className={styles["info"]}>
                        <Title level={3}>Primeiro nome</Title>
                        <Paragraph
                            editable={{
                                tooltip: "Editar nome",
                            }}
                        >
                            {user?.first_name ?? ""}
                        </Paragraph>
                    </div>
                    <div className={styles["info"]}>
                        <Title level={3}>Ultimo nome</Title>
                        <Paragraph
                            editable={{
                                tooltip: "Editar nome",
                            }}
                        >
                            {user?.last_name ?? ""}
                        </Paragraph>
                    </div>
                    <div className={styles["info"]}>
                        <Title level={3}>E-mail</Title>
                        <Paragraph>{user?.email ?? ""}</Paragraph>
                    </div>
                </div>
                <div className={`${styles["info-container"]} ${styles[theme]}`}>
                    <div className={styles["info"]}>
                        <Title level={3}>Ultimo login</Title>
                        <div>{user?.last_login ? formatDate(user.last_login) : ""}</div>
                    </div>
                    <div className={styles["info"]}>
                        <Title level={3}>Data cadastrada</Title>
                        <div>{user?.date_joined ? formatDate(user.date_joined) : ""}</div>
                    </div>
                    <div className={styles["info"]}>
                        <Title level={3}>Senha</Title>
                        <div>Alterar senha</div>
                    </div>
                </div>
                <Button
                    style={{
                        marginRight: "16px",
                        float: "right",
                    }}
                    type="primary"
                    danger
                    onClick={handleSignout}
                >
                    Deslogar
                </Button>
            </div>
        </>
    );
};

User.auth = {
    role: "user",
    loading: <LoadingPage />,
    unauthorized: "/signin",
};

export default User;
