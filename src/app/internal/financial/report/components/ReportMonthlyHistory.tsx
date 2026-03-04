import { Card, Col, Row, Spin, Table, Tag } from "antd";

import { useReport } from "@/components/providers/report";
import { IPaymentMonth } from "@/services/financial/report";
import { formatMoney } from "@/util";

import styles from "../Overview.module.scss";

export function ReportMonthlyHistory() {
    const { isLoadingPage, tableData } = useReport();

    return (
        <Row gutter={[16, 16]} className={styles.detailsRow}>
            <Col xs={24}>
                <Card title="Historico mensal consolidado" className={styles.tableCard} loading={isLoadingPage}>
                    {isLoadingPage ? (
                        <Spin />
                    ) : (
                        <Table
                            size="small"
                            rowKey={(record) => String(record.id)}
                            dataSource={tableData}
                            pagination={{ pageSize: 12 }}
                            columns={[
                                { title: "Mes", dataIndex: "month", key: "month" },
                                {
                                    title: "Entradas",
                                    dataIndex: "total_value_credit",
                                    key: "total_value_credit",
                                    render: (value: number) => formatMoney(value || 0),
                                },
                                {
                                    title: "Saidas",
                                    dataIndex: "total_value_debit",
                                    key: "total_value_debit",
                                    render: (value: number) => formatMoney(value || 0),
                                },
                                {
                                    title: "Saldo",
                                    key: "balance",
                                    render: (_: unknown, record: IPaymentMonth) => {
                                        const balance =
                                            (record.total_value_credit || 0) - (record.total_value_debit || 0);
                                        const color = balance >= 0 ? "green" : "red";

                                        return <Tag color={color}>{formatMoney(balance)}</Tag>;
                                    },
                                },
                                {
                                    title: "Em aberto",
                                    dataIndex: "total_value_open",
                                    key: "total_value_open",
                                    render: (value: number) => formatMoney(value || 0),
                                },
                                {
                                    title: "Fechado",
                                    dataIndex: "total_value_closed",
                                    key: "total_value_closed",
                                    render: (value: number) => formatMoney(value || 0),
                                },
                                {
                                    title: "Lancamentos",
                                    dataIndex: "total_payments",
                                    key: "total_payments",
                                },
                            ]}
                        />
                    )}
                </Card>
            </Col>
        </Row>
    );
}
