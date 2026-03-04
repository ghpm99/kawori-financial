import { Breadcrumb, Space, Tag, Typography } from "antd";

import { useReport } from "@/components/providers/report";

import styles from "../Overview.module.scss";

const { Paragraph, Title } = Typography;

export function ReportHeader() {
    const { periodLabel } = useReport();

    return (
        <>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Relatorios" }]}
            />

            <div className={styles.header}>
                <Title level={3}>Relatorios Financeiros</Title>
                <Paragraph>
                    Painel de decisao para acompanhar saude financeira, priorizar pendencias e ajustar o planejamento do
                    proximo ciclo.
                </Paragraph>
                <Space wrap>
                    <Tag color="blue">Periodo: {periodLabel}</Tag>
                </Space>
            </div>
        </>
    );
}
