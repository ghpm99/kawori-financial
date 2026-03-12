"use client";

import { useState } from "react";
import { Alert, Breadcrumb, Card, Col, DatePicker, Empty, Row, Space, Statistic, Table, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs, { Dayjs } from "dayjs";
import { ColumnType } from "antd/lib/table/interface";

import { formatMoney, formatterDate } from "@/util/index";
import { fetchStatementService, StatementFilters, StatementTransaction } from "@/services/financial/statement";

import styles from "./monthly.module.scss";

const { RangePicker } = DatePicker;
const { Title: AntTitle, Text } = Typography;

const rangePresets: { label: string; value: [Dayjs, Dayjs] }[] = [
    { label: "Este mês", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
    {
        label: "Mês anterior",
        value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")],
    },
    { label: "Últimos 3 meses", value: [dayjs().subtract(2, "month").startOf("month"), dayjs().endOf("month")] },
    { label: "Este ano", value: [dayjs().startOf("year"), dayjs().endOf("month")] },
];

function StatementPage() {
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([dayjs().startOf("month"), dayjs().endOf("month")]);

    const filters: StatementFilters = {
        date_from: dateRange[0].format("YYYY-MM-DD"),
        date_to: dateRange[1].format("YYYY-MM-DD"),
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["financial-statement", filters],
        queryFn: () => fetchStatementService(filters),
    });

    const columns: ColumnType<StatementTransaction>[] = [
        {
            title: "Data",
            dataIndex: "payment_date",
            key: "payment_date",
            width: 120,
            render: (date: string) => formatterDate(date),
        },
        {
            title: "Descrição",
            dataIndex: "name",
            key: "name",
            render: (_: string, record: StatementTransaction) => (
                <>
                    <span>{record.name}</span>
                    {record.invoice_name && <span className={styles.invoiceName}>{record.invoice_name}</span>}
                    {record.tags.length > 0 && (
                        <div>
                            {record.tags.map((tag) => (
                                <Tag key={tag.id} color={tag.color} style={{ marginTop: 4 }}>
                                    {tag.name}
                                </Tag>
                            ))}
                        </div>
                    )}
                </>
            ),
        },
        {
            title: "Valor",
            dataIndex: "value",
            key: "value",
            width: 160,
            align: "right",
            render: (value: number, record: StatementTransaction) =>
                record.type === 0 ? (
                    <Tag color="green">+{formatMoney(value)}</Tag>
                ) : (
                    <Tag color="volcano">-{formatMoney(value)}</Tag>
                ),
        },
        {
            title: "Saldo",
            dataIndex: "running_balance",
            key: "running_balance",
            width: 160,
            align: "right",
            render: (balance: number) => (
                <span className={balance >= 0 ? styles.balancePositive : styles.balanceNegative}>
                    {formatMoney(balance)}
                </span>
            ),
        },
    ];

    const apiErrorMessage = error instanceof Error ? error.message : "Erro ao carregar extrato. Tente novamente.";

    const is400Error =
        error &&
        "response" in (error as object) &&
        (error as { response?: { status?: number } }).response?.status === 400;

    return (
        <>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Extrato Bancário" }]}
            />

            <div className={styles.header}>
                <AntTitle level={3} className={styles.title}>
                    Extrato Bancário
                </AntTitle>
                <p className={styles.subtitle}>
                    Visualize suas transações baixadas em ordem cronológica com saldo acumulado.
                </p>
            </div>

            <Card className={styles.filtersCard} size="small">
                <Space wrap>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setDateRange([dates[0], dates[1]]);
                            }
                        }}
                        presets={rangePresets}
                        format="DD/MM/YYYY"
                        allowClear={false}
                        suffixIcon={<SearchOutlined />}
                    />
                </Space>
            </Card>

            {isError && (
                <Alert
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                    message={is400Error ? "Parâmetros de data inválidos." : apiErrorMessage}
                />
            )}

            <Row gutter={[16, 16]} className={styles.summaryRow}>
                <Col xs={12} sm={6}>
                    <Card className={`${styles.summaryCard} ${styles.openingBalance}`} loading={isLoading}>
                        <Statistic
                            title="Saldo Inicial"
                            value={data?.summary.opening_balance ?? 0}
                            prefix="R$"
                            precision={2}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className={`${styles.summaryCard} ${styles.credits}`} loading={isLoading}>
                        <Statistic
                            title="Entradas"
                            value={data?.summary.total_credits ?? 0}
                            prefix="R$"
                            precision={2}
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className={`${styles.summaryCard} ${styles.debits}`} loading={isLoading}>
                        <Statistic
                            title="Saídas"
                            value={data?.summary.total_debits ?? 0}
                            prefix="R$"
                            precision={2}
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className={`${styles.summaryCard} ${styles.closingBalance}`} loading={isLoading}>
                        <Statistic
                            title="Saldo Final"
                            value={data?.summary.closing_balance ?? 0}
                            prefix="R$"
                            precision={2}
                            valueStyle={{
                                color: (data?.summary.closing_balance ?? 0) >= 0 ? "#52c41a" : "#ff4d4f",
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {!isLoading && !isError && data?.transactions.length === 0 ? (
                <Card className={styles.emptyCard}>
                    <Empty description="Nenhuma transação baixada no período selecionado." />
                </Card>
            ) : (
                <Card className={styles.tableCard}>
                    <Table
                        columns={columns}
                        dataSource={data?.transactions}
                        loading={isLoading}
                        rowKey="id"
                        pagination={false}
                        summary={(pageData) => <TableSummary transactions={pageData} />}
                        scroll={{ x: 600 }}
                    />
                </Card>
            )}
        </>
    );
}

function TableSummary({ transactions }: { transactions: readonly StatementTransaction[] }) {
    let totalCredits = 0;
    let totalDebits = 0;

    transactions.forEach((t) => {
        if (t.type === 0) {
            totalCredits += t.value;
        } else {
            totalDebits += t.value;
        }
    });

    return (
        <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}>
                <Text strong>Totais:</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} align="right">
                <Tag color="green">+{formatMoney(totalCredits)}</Tag>
                <Tag color="volcano">-{formatMoney(totalDebits)}</Tag>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
                <Text strong>{formatMoney(totalCredits - totalDebits)}</Text>
            </Table.Summary.Cell>
        </Table.Summary.Row>
    );
}

export default StatementPage;
