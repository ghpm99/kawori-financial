"use client";

import { useEffect, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import {
    Alert,
    Breadcrumb,
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    Form,
    Layout,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    FinancialReportFilters,
    IPaymentChartData,
    IPaymentMonth,
    fetchAmountForecastValueService,
    fetchAmountInvoiceByTagReportService,
    fetchAmountPaymentClosedReportService,
    fetchAmountPaymentOpenReportService,
    fetchAmountPaymentReportService,
    fetchCountPaymentReportService,
    fetchFinancialMetricsService,
    fetchMonthPayments,
    fetchPaymentReportService,
} from "@/services/financial/report";
import { formatMoney, formatterMonthYearDate, getStringValue, updateSearchParams } from "@/util";

import styles from "./Overview.module.scss";

const { Title, Paragraph, Text } = Typography;

type FilterFormValues = {
    period?: [Dayjs, Dayjs];
};

const STATUS_COLORS = ["#52c41a", "#faad14"];

const normalizeFilters = (filters: FinancialReportFilters): FinancialReportFilters => {
    const normalized: FinancialReportFilters = {};

    if (filters.date_from?.trim()) {
        normalized.date_from = filters.date_from.trim();
    }
    if (filters.date_to?.trim()) {
        normalized.date_to = filters.date_to.trim();
    }

    return normalized;
};

const getFiltersFromSearchParams = (searchParams: URLSearchParams): FinancialReportFilters =>
    normalizeFilters({
        date_from: getStringValue(searchParams.get("date_from") ?? undefined),
        date_to: getStringValue(searchParams.get("date_to") ?? undefined),
    });

const percentage = (value: number, total: number): number => {
    if (total <= 0) {
        return 0;
    }

    return Number(((value / total) * 100).toFixed(1));
};

const toMonthTrend = (payments: IPaymentChartData[]) =>
    payments.map((entry) => ({
        month: formatterMonthYearDate(entry.label),
        credit: entry.credit,
        debit: entry.debit,
        difference: entry.difference,
        accumulated: entry.accumulated,
    }));

const toMonthTable = (rows: IPaymentMonth[]) =>
    rows.map((entry) => ({
        ...entry,
        key: entry.id,
        month: formatterMonthYearDate(entry.date || entry.name),
    }));

export default function ReportPage() {
    const [form] = Form.useForm<FilterFormValues>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeFilters = useMemo(() => getFiltersFromSearchParams(searchParams), [searchParams]);

    useEffect(() => {
        const hasRange = activeFilters.date_from && activeFilters.date_to;
        form.setFieldsValue({
            period: hasRange ? [dayjs(activeFilters.date_from), dayjs(activeFilters.date_to)] : undefined,
        });
    }, [activeFilters, form]);

    const paymentsQuery = useQuery({
        queryKey: ["financial-report", "payments", activeFilters],
        queryFn: () => fetchPaymentReportService(activeFilters),
    });

    const monthQuery = useQuery({
        queryKey: ["financial-report", "month", activeFilters],
        queryFn: () => fetchMonthPayments(activeFilters),
    });

    const countPaymentQuery = useQuery({
        queryKey: ["financial-report", "count-payment", activeFilters],
        queryFn: () => fetchCountPaymentReportService(activeFilters),
    });

    const amountPaymentQuery = useQuery({
        queryKey: ["financial-report", "amount-payment", activeFilters],
        queryFn: () => fetchAmountPaymentReportService(activeFilters),
    });

    const amountPaymentOpenQuery = useQuery({
        queryKey: ["financial-report", "amount-payment-open", activeFilters],
        queryFn: () => fetchAmountPaymentOpenReportService(activeFilters),
    });

    const amountPaymentClosedQuery = useQuery({
        queryKey: ["financial-report", "amount-payment-closed", activeFilters],
        queryFn: () => fetchAmountPaymentClosedReportService(activeFilters),
    });

    const invoiceByTagQuery = useQuery({
        queryKey: ["financial-report", "invoice-by-tag", activeFilters],
        queryFn: () => fetchAmountInvoiceByTagReportService(activeFilters),
    });

    const amountForecastValueQuery = useQuery({
        queryKey: ["financial-report", "forecast", activeFilters],
        queryFn: () => fetchAmountForecastValueService(activeFilters),
    });

    const metricsQuery = useQuery({
        queryKey: ["financial-report", "metrics", activeFilters],
        queryFn: () => fetchFinancialMetricsService(activeFilters),
    });

    const isLoadingPage =
        paymentsQuery.isLoading ||
        monthQuery.isLoading ||
        countPaymentQuery.isLoading ||
        amountPaymentQuery.isLoading ||
        amountPaymentOpenQuery.isLoading ||
        amountPaymentClosedQuery.isLoading ||
        invoiceByTagQuery.isLoading ||
        amountForecastValueQuery.isLoading ||
        metricsQuery.isLoading;

    const isFetchingPage =
        paymentsQuery.isFetching ||
        monthQuery.isFetching ||
        countPaymentQuery.isFetching ||
        amountPaymentQuery.isFetching ||
        amountPaymentOpenQuery.isFetching ||
        amountPaymentClosedQuery.isFetching ||
        invoiceByTagQuery.isFetching ||
        amountForecastValueQuery.isFetching ||
        metricsQuery.isFetching;

    const error =
        paymentsQuery.error ||
        monthQuery.error ||
        countPaymentQuery.error ||
        amountPaymentQuery.error ||
        amountPaymentOpenQuery.error ||
        amountPaymentClosedQuery.error ||
        invoiceByTagQuery.error ||
        amountForecastValueQuery.error ||
        metricsQuery.error;

    const trendData = useMemo(() => toMonthTrend(paymentsQuery.data?.payments || []), [paymentsQuery.data?.payments]);
    const tableData = useMemo(() => toMonthTable(monthQuery.data?.data || []), [monthQuery.data?.data]);
    const invoiceByTagData = invoiceByTagQuery.data || [];

    const revenues = metricsQuery.data?.revenues.value ?? trendData.reduce((acc, curr) => acc + curr.credit, 0);
    const expenses = metricsQuery.data?.expenses.value ?? trendData.reduce((acc, curr) => acc + curr.debit, 0);
    const profit = metricsQuery.data?.profit.value ?? revenues - expenses;
    const growth = metricsQuery.data?.growth.value ?? 0;
    const totalPayments = amountPaymentQuery.data || 0;
    const totalOpen = amountPaymentOpenQuery.data || 0;
    const totalClosed = amountPaymentClosedQuery.data || 0;
    const totalCount = countPaymentQuery.data || 0;
    const forecast = amountForecastValueQuery.data || 0;

    const openShare = percentage(totalOpen, totalPayments);
    const closedShare = percentage(totalClosed, totalPayments);
    const averageTicket = totalCount > 0 ? totalPayments / totalCount : 0;
    const savingsRate = percentage(profit, revenues);
    const forecastAccuracy = forecast > 0 ? percentage(totalPayments, forecast) : 0;
    const forecastGap = totalPayments - forecast;

    const paymentStatusData = [
        { name: "Pagamentos fechados", value: totalClosed },
        { name: "Pagamentos em aberto", value: totalOpen },
    ];

    const insights = [
        profit >= 0
            ? "Resultado liquido positivo no periodo. Mantenha o ritmo de sobra mensal para criar reserva."
            : "Resultado liquido negativo no periodo. Revisar despesas recorrentes e gastos variaveis e prioridade imediata.",
        openShare > 35
            ? "Alto volume financeiro em aberto. Priorize liquidacao para reduzir risco de atraso e juros."
            : "Volume em aberto controlado para o periodo selecionado.",
        forecast > 0
            ? `Aderencia ao previsto: ${forecastAccuracy.toFixed(1)}%. Diferenca absoluta de ${formatMoney(forecastGap)}.`
            : "Nao ha base prevista para comparar realizado x planejado neste periodo.",
    ];

    const applyFilters = (values: FilterFormValues) => {
        const period = values.period;

        const nextFilters: FinancialReportFilters = normalizeFilters({
            date_from: period?.[0]?.format("YYYY-MM-DD"),
            date_to: period?.[1]?.format("YYYY-MM-DD"),
        });

        updateSearchParams(router, pathname, nextFilters);
    };

    const clearFilters = () => {
        form.resetFields();
        updateSearchParams(router, pathname, {});
    };

    const hasAnyData = trendData.length > 0 || tableData.length > 0 || invoiceByTagData.length > 0;

    return (
        <div className={styles.wrapper}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Relatorios" }]}
            />
            <Layout>
                <div className={styles.header}>
                    <Title level={3}>Relatorios Financeiros</Title>
                    <Paragraph>
                        Painel de insights para acompanhar saldo, saude das contas, concentracao de gastos e evolucao
                        do fluxo ao longo do periodo.
                    </Paragraph>
                </div>

                <Card title="Filtro de periodo" className={styles.filtersCard}>
                    <Form form={form} layout="vertical" onFinish={applyFilters}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12} lg={10}>
                                <Form.Item name="period" label="Periodo de analise">
                                    <DatePicker.RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12} lg={14} className={styles.filterActionsCol}>
                                <Space wrap>
                                    <Button type="primary" htmlType="submit" loading={isFetchingPage}>
                                        Atualizar relatorios
                                    </Button>
                                    <Button onClick={clearFilters} disabled={isFetchingPage}>
                                        Limpar filtro
                                    </Button>
                                    {isFetchingPage ? <Text type="secondary">Atualizando dados...</Text> : null}
                                </Space>
                            </Col>
                        </Row>
                    </Form>

                    {(activeFilters.date_from || activeFilters.date_to) && (
                        <Space className={styles.filterTags} wrap>
                            {activeFilters.date_from ? <Tag>{`Data inicial: ${activeFilters.date_from}`}</Tag> : null}
                            {activeFilters.date_to ? <Tag>{`Data final: ${activeFilters.date_to}`}</Tag> : null}
                        </Space>
                    )}
                </Card>

                {error ? (
                    <Alert
                        type="error"
                        showIcon
                        message="Falha ao carregar relatorios financeiros"
                        description={
                            (error as AxiosError<{ msg?: string }>)?.response?.data?.msg ||
                            "Nao foi possivel consultar os endpoints de relatorio financeiro."
                        }
                        style={{ marginBottom: 16 }}
                    />
                ) : null}

                <Row gutter={[16, 16]} className={styles.statsRow}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Receitas" value={formatMoney(revenues)} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Despesas" value={formatMoney(expenses)} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Resultado liquido" value={formatMoney(profit)} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Crescimento" value={growth} suffix="%" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Taxa de poupanca" value={savingsRate} suffix="%" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Ticket medio" value={formatMoney(averageTicket)} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Em aberto" value={openShare} suffix="%" />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoadingPage}>
                            <Statistic title="Fechados" value={closedShare} suffix="%" />
                        </Card>
                    </Col>
                </Row>

                {!isLoadingPage && !hasAnyData ? (
                    <Card>
                        <Empty description="Nao ha dados para o periodo selecionado." />
                    </Card>
                ) : null}

                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Entradas x Saidas por mes" className={styles.chartCard} loading={isLoadingPage}>
                            <div className={styles.chartArea}>
                                <ResponsiveContainer>
                                    <LineChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                        <Legend />
                                        <Line type="monotone" dataKey="credit" name="Entradas" stroke="#52c41a" />
                                        <Line type="monotone" dataKey="debit" name="Saidas" stroke="#ff4d4f" />
                                        <Line
                                            type="monotone"
                                            dataKey="difference"
                                            name="Saldo mensal"
                                            stroke="#1677ff"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Evolucao do saldo acumulado" className={styles.chartCard} loading={isLoadingPage}>
                            <div className={styles.chartArea}>
                                <ResponsiveContainer>
                                    <AreaChart data={trendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="accumulated"
                                            name="Acumulado"
                                            stroke="#1677ff"
                                            fill="#1677ff33"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Composicao de gastos por categoria" className={styles.chartCard} loading={isLoadingPage}>
                            {invoiceByTagData.length === 0 ? (
                                <div className={styles.chartEmpty}>
                                    <Empty description="Sem dados por categoria" />
                                </div>
                            ) : (
                                <div className={styles.chartArea}>
                                    <ResponsiveContainer>
                                        <BarChart data={invoiceByTagData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                                            <YAxis />
                                            <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                            <Legend />
                                            <Bar dataKey="amount" name="Valor total" fill="#1677ff" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Saude das pendencias" className={styles.chartCard} loading={isLoadingPage}>
                            <div className={styles.chartArea}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={paymentStatusData} dataKey="value" nameKey="name" outerRadius={105} label>
                                            {paymentStatusData.map((item, index) => (
                                                <Cell key={item.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className={styles.detailsRow}>
                    <Col xs={24} lg={12}>
                        <Card title="Diagnostico automatico" className={styles.tableCard} loading={isLoadingPage}>
                            <Space direction="vertical" size={12} className={styles.insightsList}>
                                {insights.map((item, index) => (
                                    <Alert key={index} type="info" showIcon message={item} />
                                ))}
                                <Alert
                                    type="warning"
                                    showIcon
                                    message={`Previsao do periodo: ${formatMoney(forecast)} | Realizado: ${formatMoney(totalPayments)}`}
                                    description={`Diferenca entre realizado e previsto: ${formatMoney(forecastGap)}.`}
                                />
                                <Alert
                                    type="success"
                                    showIcon
                                    message={`Fixos no periodo: receitas ${formatMoney(paymentsQuery.data?.fixed_credit || 0)} e despesas ${formatMoney(paymentsQuery.data?.fixed_debit || 0)}.`}
                                />
                            </Space>
                        </Card>
                    </Col>

                    <Col xs={24} lg={12}>
                        <Card title="Resumo de cobertura" className={styles.tableCard} loading={isLoadingPage}>
                            <Table
                                size="small"
                                pagination={false}
                                rowKey={(record) => record.label}
                                dataSource={[
                                    {
                                        label: "Total movimentado",
                                        value: formatMoney(totalPayments),
                                    },
                                    {
                                        label: "Total em aberto",
                                        value: `${formatMoney(totalOpen)} (${openShare.toFixed(1)}%)`,
                                    },
                                    {
                                        label: "Total fechado",
                                        value: `${formatMoney(totalClosed)} (${closedShare.toFixed(1)}%)`,
                                    },
                                    {
                                        label: "Aderencia ao previsto",
                                        value: `${forecastAccuracy.toFixed(1)}%`,
                                    },
                                    {
                                        label: "Quantidade de lancamentos",
                                        value: String(totalCount),
                                    },
                                ]}
                                columns={[
                                    { title: "Indicador", dataIndex: "label", key: "label" },
                                    { title: "Valor", dataIndex: "value", key: "value" },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>

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
                                                const balance = (record.total_value_credit || 0) - (record.total_value_debit || 0);
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
            </Layout>
        </div>
    );
}
