import { Alert, Card, Col, Row, Space, Table, Tag, Typography } from "antd";

import { useReport } from "@/components/providers/report";
import { formatMoney } from "@/util";

import styles from "../Overview.module.scss";

const { Text } = Typography;

const severityToAlertType = {
    critical: "error",
    attention: "warning",
    good: "success",
} as const;

const severityToLabel = {
    critical: "Prioridade alta",
    attention: "Atencao",
    good: "Estavel",
} as const;

export function ReportInsights() {
    const { isLoadingPage, insights, priorityInsights, coverageData, kpis } = useReport();

    return (
        <Row gutter={[16, 16]} className={styles.detailsRow}>
            <Col xs={24} lg={12}>
                <Card title="Plano de acao recomendado" className={styles.tableCard} loading={isLoadingPage}>
                    <Space direction="vertical" size={12} className={styles.insightsList}>
                        {priorityInsights.map((insight) => (
                            <Alert
                                key={insight.id}
                                type={severityToAlertType[insight.severity]}
                                showIcon
                                message={
                                    <Space size={8} wrap>
                                        <Text strong>{insight.title}</Text>
                                        <Tag>{severityToLabel[insight.severity]}</Tag>
                                        <Tag color="blue">{insight.metric}</Tag>
                                    </Space>
                                }
                                description={
                                    <>
                                        <div>{insight.context}</div>
                                        <Text strong>Acao: </Text>
                                        <Text>{insight.action}</Text>
                                    </>
                                }
                            />
                        ))}

                        {insights.length > 0 ? <Alert type="info" showIcon message={insights[0]} /> : null}

                        <Alert
                            type="warning"
                            showIcon
                            message={`Previsao do periodo: ${formatMoney(kpis.forecast)} | Realizado: ${formatMoney(kpis.totalPayments)}`}
                            description={`Diferenca entre realizado e previsto: ${formatMoney(kpis.forecastGap)}.`}
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
