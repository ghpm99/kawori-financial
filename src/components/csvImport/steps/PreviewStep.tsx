"use client";

import { ParsedTransaction, useCsvImportProvider } from "@/components/providers/csvImport";
import { formatMoney, formatterDate } from "@/util";
import { SearchOutlined } from "@ant-design/icons";
import { Card, Checkbox, Input, Table, Tag } from "antd";
import styles from "../steps/steps.module.scss";

const { Search } = Input;

type DataSourceType = {
    id: string;
} & ParsedTransaction;

export default function PreviewStep() {
    const {
        filteredTransactions,
        stats,
        toggleSelection,
        toggleAllSelection,
        searchTerm,
        setSearchTerm,
        selectAllState,
    } = useCsvImportProvider();

    const columns = [
        {
            title: "",
            dataIndex: "selected",
            key: "selected",
            render: (_: boolean, record: DataSourceType) => (
                <Checkbox
                    checked={record.selected}
                    disabled={!record.is_valid}
                    onChange={() => toggleSelection(record.id)}
                />
            ),
            width: 48,
        },
        {
            title: "Descrição",
            dataIndex: ["mapped_data", "description"],
            key: "desc",
            render: (v: string, record: DataSourceType) => (
                <div>
                    <div style={{ fontWeight: 700 }}>{v ?? "-"}</div>
                    {record.validation_errors?.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            {record.validation_errors.map((e: string, i: number) => (
                                <Tag color="error" key={i} style={{ marginBottom: 6 }}>
                                    {e}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            ),
            ellipsis: true,
        },
        {
            title: "Data",
            dataIndex: ["mapped_data", "date"],
            key: "date",
            render: (date: string) => (date ? formatterDate(date) : "-"),
            width: 120,
        },
        {
            title: "Valor",
            dataIndex: ["mapped_data", "value"],
            key: "value",
            render: (value: number) => (
                <div style={{ fontWeight: 700 }}>{value != null ? formatMoney(value) : "-"}</div>
            ),
            width: 140,
        },
        {
            title: "Tipo",
            dataIndex: ["mapped_data", "type"],
            key: "type",
            render: (type: number) => (
                <Tag color={type === 0 ? "success" : "error"}>{type === 0 ? "Receita" : "Despesa"}</Tag>
            ),
            width: 120,
        },
        {
            title: "Status",
            dataIndex: "is_valid",
            key: "is_valid",
            render: (isValid: boolean) => (isValid ? <Tag color="success">Válido</Tag> : <Tag color="error">Erro</Tag>),
            width: 120,
        },
    ];

    const dataSource: DataSourceType[] = filteredTransactions.map((t) => ({ ...t, key: t.id }));

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div className={styles.statsGrid}>
                <Card>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>{stats.total}</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>Total</div>
                </Card>
                <Card>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#237804" }}>{stats.valid}</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>Válidos</div>
                </Card>
                <Card>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#a8071a" }}>{stats.invalid}</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>Com erros</div>
                </Card>
                <Card>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#1890ff" }}>{stats.selected}</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>Selecionados</div>
                </Card>
            </div>

            <div
                style={{
                    padding: 12,
                    borderBottom: "1px solid var(--ant-border-color-base)",
                    display: "flex",
                    gap: 12,
                }}
            >
                <div style={{ flex: 1 }}>
                    <Search
                        placeholder="Buscar transações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Checkbox checked={selectAllState} onChange={(e) => toggleAllSelection(e.target.checked)} />{" "}
                    Selecionar todos
                </div>
            </div>

            <div style={{ padding: 12 }}>
                <Table
                    scroll={{ y: "380px" }}
                    columns={columns}
                    dataSource={dataSource}
                    pagination={false}
                    rowKey="id"
                />
            </div>
        </div>
    );
}
