import { Alert, Card, Col, Row, Space, Table } from "antd";

import { useReport } from "@/components/providers/report";
import { formatMoney } from "@/util";

import styles from "../Overview.module.scss";

export function ReportInsights() {
    const { isLoadingPage, insights, coverageData, kpis } = useReport();

    return (
        <Row gutter={[16, 16]} className={styles.detailsRow}>
            <Col xs={24} lg={12}>
                <Card title="Diagnostico automatico" className={styles.tableCard} loading={isLoadingPage}>
                    <Space direction="vertical" size={12} className={styles.insightsList}>
                        {insights.map((item, index) => (
                            <Alert key={`${item}-${index}`} type="info" showIcon message={item} />
                        ))}
                        <Alert
                            type="warning"
                            showIcon
                            message={`Previsao do periodo: ${formatMoney(kpis.forecast)} | Realizado: ${formatMoney(kpis.totalPayments)}`}
                            description={`Diferenca entre realizado e previsto: ${formatMoney(kpis.forecastGap)}.`}
                        />
                        <Alert
                            type="success"
                            showIcon
                            message={`Fixos no periodo: receitas ${formatMoney(kpis.fixedCredit)} e despesas ${formatMoney(kpis.fixedDebit)}.`}
                        />
                    </Space>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="Resumo de cobertura" className={styles.tableCard} loading={isLoadingPage}>
                    <Table
                        size="small"
                        pagination={false}
                        dataSource={coverageData}
                        columns={[
                            { title: "Indicador", dataIndex: "label", key: "label" },
                            { title: "Valor", dataIndex: "value", key: "value" },
                        ]}
                    />
                </Card>
            </Col>
        </Row>
    );
}
