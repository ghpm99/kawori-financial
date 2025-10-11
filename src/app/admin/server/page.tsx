"use client";
import { Breadcrumb, Button, Layout, message } from "antd";

import LoadingPage from "@/components/loadingPage/Index";
import { updateAllContractsValue } from "@/services/financial";
import styles from "./Server.module.scss";
import { useEffect } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { setSelectedMenu } from "@/lib/features/auth";

function ServerPage() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        document.title = "Kawori Server";
        dispatch(setSelectedMenu(["server"]));
    }, []);

    const updateContractsValue = () => {
        message.loading({
            content: "Calculando contratos",
            key: "calculate-contracts",
        });
        updateAllContractsValue().then((response) => {
            message.success({
                content: response.data.msg,
                key: "calculate-contracts",
            });
        });
    };

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Servidor</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles["button-container"]}>
                    <Button type="primary" onClick={updateContractsValue}>
                        Calcular valores contratos
                    </Button>
                </div>
            </Layout>
        </>
    );
}

ServerPage.auth = {
    role: "admin",
    loading: <LoadingPage />,
    unauthorized: "/signin",
};

export default ServerPage;
