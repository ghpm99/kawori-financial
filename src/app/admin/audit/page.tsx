"use client";

import { useEffect, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import {
    Alert,
    Breadcrumb,
    Button,
    Card,
    Col,
    Empty,
    Form,
    Input,
    InputNumber,
    Layout,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tag,
    Typography,
} from "antd";
import { AxiosError } from "axios";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
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

import { useUser } from "@/components/providers/user";
import { AuditReportData, AuditReportFilters, fetchAuditReportService } from "@/services/audit";
import { getNumberValue, getStringValue, updateSearchParams } from "@/util";

import styles from "./audit.module.scss";

const { Title, Paragraph, Text } = Typography;

const DEFAULT_LIMIT = 20;
const PIE_COLORS = ["#1677ff", "#13c2c2", "#52c41a", "#faad14", "#fa541c", "#722ed1"];

const categoryOptions = ["auth", "financial", "facetexture", "classification", "remote", "pusher"].map((value) => ({
    label: value,
    value,
}));

const resultOptions = [
    { label: "success", value: "success" },
    { label: "failure", value: "failure" },
    { label: "error", value: "error" },
];

const defaultAuditData: AuditReportData = {
    filters: {},
    summary: {
        total_events: 0,
        unique_users: 0,
        success_events: 0,
        failure_events: 0,
        error_events: 0,
    },
    interactions_by_day: [],
    by_action: [],
    by_category: [],
    by_user: [],
    failures_by_action: [],
};

const normalizeFilters = (filters: AuditReportFilters): AuditReportFilters => {
    const normalized: AuditReportFilters = {};

    if (filters.category?.trim()) {
        normalized.category = filters.category.trim();
    }
    if (filters.action?.trim()) {
        normalized.action = filters.action.trim();
    }
    if (filters.result) {
        normalized.result = filters.result;
    }
    if (filters.user_id !== undefined && filters.user_id !== null && String(filters.user_id).trim() !== "") {
        normalized.user_id = String(filters.user_id).trim();
    }
    if (filters.username?.trim()) {
        normalized.username = filters.username.trim();
    }
    if (filters.date_from?.trim()) {
        normalized.date_from = filters.date_from.trim();
    }
    if (filters.date_to?.trim()) {
        normalized.date_to = filters.date_to.trim();
    }

    const limit = Number(filters.limit ?? DEFAULT_LIMIT);
    normalized.limit = isNaN(limit) ? DEFAULT_LIMIT : Math.min(Math.max(limit, 1), 100);

    return normalized;
};

const getFiltersFromSearchParams = (searchParams: URLSearchParams): AuditReportFilters =>
    normalizeFilters({
        category: getStringValue(searchParams.get("category") ?? undefined),
        action: getStringValue(searchParams.get("action") ?? undefined),
        result: getStringValue(searchParams.get("result") ?? undefined) as AuditReportFilters["result"],
        user_id: getStringValue(searchParams.get("user_id") ?? undefined),
        username: getStringValue(searchParams.get("username") ?? undefined),
        date_from: getStringValue(searchParams.get("date_from") ?? undefined),
        date_to: getStringValue(searchParams.get("date_to") ?? undefined),
        limit: getNumberValue(searchParams.get("limit") ?? undefined),
    });

const percentage = (value: number, total: number) => (total > 0 ? ((value / total) * 100).toFixed(1) : "0.0");

const getResultTagColor = (result: string) => {
    if (result === "success") return "green";
    if (result === "failure") return "gold";
    return "red";
};

export default function AuditPage() {
    const [form] = Form.useForm<AuditReportFilters>();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { groups, loading } = useUser();

    const isAdmin = groups?.includes("admin");
    const activeFilters = useMemo(() => getFiltersFromSearchParams(searchParams), [searchParams]);

    useEffect(() => {
        form.setFieldsValue(activeFilters);
    }, [form, activeFilters]);

    const { data, isLoading, isFetching, error } = useQuery({
        queryKey: ["audit-report", activeFilters],
        queryFn: () => fetchAuditReportService(activeFilters),
        enabled: isAdmin,
    });

    const report = data ?? defaultAuditData;
    const summary = report.summary;
    const successRate = percentage(summary.success_events, summary.total_events);
    const failureRate = percentage(summary.failure_events, summary.total_events);
    const errorRate = percentage(summary.error_events, summary.total_events);

    const hasAnyData =
        summary.total_events > 0 ||
        report.by_action.length > 0 ||
        report.by_category.length > 0 ||
        report.by_user.length > 0 ||
        report.interactions_by_day.length > 0;

    const filterTags = Object.entries(activeFilters).filter(([_, value]) => value !== undefined && value !== "");

    const applyFilters = (values: AuditReportFilters) => {
        const nextFilters = normalizeFilters(values);
        updateSearchParams(router, pathname, nextFilters);
    };

    const clearFilters = () => {
        const resetFilters: AuditReportFilters = { limit: DEFAULT_LIMIT };
        form.resetFields();
        form.setFieldsValue(resetFilters);
        updateSearchParams(router, pathname, resetFilters);
    };

    if (loading) {
        return (
            <div>
                <Spin />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <Alert
                type="error"
                showIcon
                message="Acesso negado"
                description="Usuario sem permissao para visualizar auditoria. E necessario pertencer ao grupo admin."
            />
        );
    }

    return (
        <div className={styles.wrapper}>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Administracao" }, { title: "Auditoria" }]}
            />
            <Layout>
                <div className={styles.header}>
                    <Title level={3}>Auditoria do Sistema</Title>
                    <Paragraph>
                        Painel completo para investigar uso do sistema com filtros por periodo, categoria, acao,
                        resultado e usuario.
                    </Paragraph>
                </div>

                <Card title="Filtros de Consulta" className={styles.filtersCard}>
                    <Form form={form} layout="vertical" onFinish={applyFilters}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="category" label="Categoria">
                                    <Select
                                        allowClear
                                        showSearch
                                        options={categoryOptions}
                                        placeholder="Selecione ou digite"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="action" label="Acao">
                                    <Input placeholder="Ex: login, payment.create" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="result" label="Resultado">
                                    <Select
                                        allowClear
                                        options={resultOptions}
                                        placeholder="success | failure | error"
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="user_id" label="User ID">
                                    <Input placeholder="ID numerico ou string" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="username" label="Username (parcial)">
                                    <Input placeholder="Ex: admin" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="date_from" label="Data inicial">
                                    <Input placeholder="YYYY-MM-DD" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="date_to" label="Data final">
                                    <Input placeholder="YYYY-MM-DD" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={6}>
                                <Form.Item name="limit" label="Limite (1-100)">
                                    <InputNumber min={1} max={100} style={{ width: "100%" }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div className={styles.filterActions}>
                            <Button type="primary" htmlType="submit" loading={isFetching}>
                                Atualizar relatorios
                            </Button>
                            <Button onClick={clearFilters} disabled={isFetching}>
                                Limpar filtros
                            </Button>
                            {isFetching ? <Text type="secondary">Atualizando dados...</Text> : null}
                        </div>
                    </Form>

                    {filterTags.length > 0 ? (
                        <Space wrap className={styles.filterTags}>
                            {filterTags.map(([key, value]) => (
                                <Tag key={key}>{`${key}: ${String(value)}`}</Tag>
                            ))}
                        </Space>
                    ) : null}
                </Card>

                {error ? (
                    <Alert
                        type="error"
                        showIcon
                        message="Falha ao carregar relatorio de auditoria"
                        description={
                            (error as AxiosError<{ msg?: string }>)?.response?.data?.msg ||
                            "Nao foi possivel consultar /audit/report/."
                        }
                        style={{ marginBottom: 16 }}
                    />
                ) : null}

                <Row gutter={[16, 16]} className={styles.statsRow}>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoading}>
                            <Statistic title="Eventos totais" value={summary.total_events} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoading}>
                            <Statistic title="Usuarios unicos" value={summary.unique_users} />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoading}>
                            <Statistic
                                title="Sucesso"
                                value={summary.success_events}
                                suffix={<Tag color={getResultTagColor("success")}>{`${successRate}%`}</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoading}>
                            <Statistic
                                title="Falhas"
                                value={summary.failure_events}
                                suffix={<Tag color={getResultTagColor("failure")}>{`${failureRate}%`}</Tag>}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6}>
                        <Card loading={isLoading}>
                            <Statistic
                                title="Erros"
                                value={summary.error_events}
                                suffix={<Tag color={getResultTagColor("error")}>{`${errorRate}%`}</Tag>}
                            />
                        </Card>
                    </Col>
                </Row>

                {!isLoading && !hasAnyData ? (
                    <Card>
                        <Empty description="Nenhum evento encontrado para os filtros selecionados." />
                    </Card>
                ) : null}

                <Row gutter={[16, 16]}>
                    <Col xs={24} lg={12}>
                        <Card title="Interacoes por dia" className={styles.chartCard} loading={isLoading}>
                            <div className={styles.chartArea}>
                                <ResponsiveContainer>
                                    <LineChart data={report.interactions_by_day}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="day" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" name="Eventos" stroke="#1677ff" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Eventos por acao" className={styles.chartCard} loading={isLoading}>
                            <div className={styles.chartArea}>
                                <ResponsiveContainer>
                                    <BarChart data={report.by_action.slice(0, 12)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="action" interval={0} angle={-20} textAnchor="end" height={80} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" name="Eventos" fill="#13c2c2" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Distribuicao por categoria" className={styles.chartCard} loading={isLoading}>
                            {report.by_category.length === 0 ? (
                                <div className={styles.chartEmpty}>
                                    <Empty description="Sem categorias para exibir" />
                                </div>
                            ) : (
                                <div className={styles.chartArea}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={report.by_category}
                                                dataKey="count"
                                                nameKey="category"
                                                outerRadius={100}
                                                label
                                            >
                                                {report.by_category.map((entry, index) => (
                                                    <Cell
                                                        key={entry.category}
                                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Falhas por acao" className={styles.chartCard} loading={isLoading}>
                            <div className={styles.chartArea}>
                                <ResponsiveContainer>
                                    <BarChart data={report.failures_by_action.slice(0, 12)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="action" interval={0} angle={-20} textAnchor="end" height={80} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" name="Falhas" fill="#faad14" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                </Row>

                <Row gutter={[16, 16]} className={styles.detailsRow}>
                    <Col xs={24} lg={12}>
                        <Card title="Top usuarios" className={styles.tableCard} loading={isLoading}>
                            <Table
                                size="small"
                                pagination={{ pageSize: 10 }}
                                rowKey={(record) => `${record.user_id}-${record.username}`}
                                dataSource={report.by_user}
                                columns={[
                                    { title: "Username", dataIndex: "username", key: "username" },
                                    { title: "User ID", dataIndex: "user_id", key: "user_id" },
                                    {
                                        title: "Eventos",
                                        dataIndex: "count",
                                        key: "count",
                                        sorter: (a, b) => a.count - b.count,
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Detalhe por acao" className={styles.tableCard} loading={isLoading}>
                            <Table
                                size="small"
                                pagination={{ pageSize: 10 }}
                                rowKey={(record) => record.action}
                                dataSource={report.by_action}
                                columns={[
                                    { title: "Acao", dataIndex: "action", key: "action" },
                                    {
                                        title: "Eventos",
                                        dataIndex: "count",
                                        key: "count",
                                        sorter: (a, b) => a.count - b.count,
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Detalhe por categoria" className={styles.tableCard} loading={isLoading}>
                            <Table
                                size="small"
                                pagination={{ pageSize: 10 }}
                                rowKey={(record) => record.category}
                                dataSource={report.by_category}
                                columns={[
                                    { title: "Categoria", dataIndex: "category", key: "category" },
                                    {
                                        title: "Eventos",
                                        dataIndex: "count",
                                        key: "count",
                                        sorter: (a, b) => a.count - b.count,
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} lg={12}>
                        <Card title="Interacoes diarias" className={styles.tableCard} loading={isLoading}>
                            <Table
                                size="small"
                                pagination={{ pageSize: 10 }}
                                rowKey={(record) => record.day}
                                dataSource={report.interactions_by_day}
                                columns={[
                                    { title: "Dia", dataIndex: "day", key: "day" },
                                    {
                                        title: "Eventos",
                                        dataIndex: "count",
                                        key: "count",
                                        sorter: (a, b) => a.count - b.count,
                                    },
                                ]}
                            />
                        </Card>
                    </Col>
                </Row>
            </Layout>
        </div>
    );
}
