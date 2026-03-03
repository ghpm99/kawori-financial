import { Breadcrumb, Typography } from "antd";

import styles from "../Overview.module.scss";

const { Paragraph, Title } = Typography;

export function ReportHeader() {
    return (
        <>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Relatorios" }]}
            />

            <div className={styles.header}>
                <Title level={3}>Relatorios Financeiros</Title>
                <Paragraph>
                    Painel de insights para acompanhar saldo, saude das contas, concentracao de gastos e evolucao do
                    fluxo ao longo do periodo.
                </Paragraph>
            </div>
        </>
    );
}
