"use client";
import { Breadcrumb, Layout, Typography } from "antd";

import Goals from "@/components/budget/goals";
import Report from "@/components/budget/report";

import styles from "./budget.module.scss";

const { Title, Text } = Typography;

const BudgetPage = () => {
    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item href="/">Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Orçamento</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Orçamento doméstico
                    </Title>
                    <Text className={styles["sub-title"]}>
                        Controle seu orçamento doméstico com base em suas próprias metas e rendimentos.
                    </Text>
                </div>
                <div className={styles.title}></div>

                <div className={styles["container"]}>
                    <Report />
                    <Goals />
                </div>
            </Layout>
        </>
    );
};

export default BudgetPage;
