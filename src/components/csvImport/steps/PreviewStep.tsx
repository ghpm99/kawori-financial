// components/csv-import/steps/PreviewStep.tsx
"use client";
import React from "react";
import { Card, Row, Col, Input, Checkbox, Table, Tag, Badge } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ParsedTransaction } from "../types";
import styles from "../csv-import-modal.module.scss";
import { formatMoney, formatterDate } from "@/util";

const { Search } = Input;

interface Props {
    transactions: ParsedTransaction[];
    filteredTransactions: ParsedTransaction[];
    stats: { total: number; valid: number; invalid: number; selected: number; matched: number; toImport: number };

    toggleSelection: (id: string) => void;
    toggleAllSelection: (selected: boolean) => void;
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    selectAllState: boolean;
}

export default function PreviewStep({
    transactions,
    filteredTransactions,
    stats,
    toggleSelection,
    toggleAllSelection,
    searchTerm,
    setSearchTerm,
    selectAllState,
}: Props) {
    const columns = [
        {
            title: "",
            dataIndex: "checkbox",
            key: "checkbox",
            render: (_: any, rec: any) => (
                <Checkbox checked={rec.selected} disabled={!rec.isValid} onChange={() => toggleSelection(rec.id)} />
            ),
        },
        {
            title: "Descrição",
            dataIndex: ["mappedData", "description"],
            key: "desc",
            render: (v: any, rec: any) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{v ?? "-"}</div>
                    {rec.validationErrors?.length > 0 && (
                        <div style={{ marginTop: 6 }}>
                            {rec.validationErrors.map((e: string, i: number) => (
                                <Tag color="error" key={i} style={{ marginBottom: 6 }}>
                                    {e}
                                </Tag>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: "Data",
            dataIndex: ["mappedData", "date"],
            key: "date",
            render: (v: any) => (v ? formatterDate(v) : "-"),
        },
        {
            title: "Valor",
            dataIndex: ["mappedData", "amount"],
            key: "amount",
            render: (v: any, rec: any) => (
                <div style={{ fontWeight: 600 }}>
                    {rec.mappedData.type === "income" ? "+" : "-"}
                    {v != null ? formatMoney(v) : "-"}
                </div>
            ),
        },
        {
            title: "Tipo",
            dataIndex: ["mappedData", "type"],
            key: "type",
            render: (v: any) => (
                <Badge
                    count={v === "income" ? "Receita" : "Despesa"}
                    style={{
                        backgroundColor: v === "income" ? "#f6ffed" : "#fff1f0",
                        color: v === "income" ? "#237804" : "#a8071a",
                    }}
                />
            ),
        },
        {
            title: "Status",
            dataIndex: "isValid",
            key: "isValid",
            render: (v: boolean) =>
                v ? (
                    <Tag icon={<></>} color="success">
                        Válido
                    </Tag>
                ) : (
                    <Tag color="error">Erro</Tag>
                ),
        },
    ];

    const dataSource = filteredTransactions.map((t) => ({ ...t, key: t.id }));

    return (
        <div className="previewStep" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <div className={styles.previewStats}>
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
                <div style={{ flex: 1, position: "relative" }}>
                    <Search
                        placeholder="Buscar transações..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                        prefix={<SearchOutlined />}
                        allowClear
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Checkbox checked={selectAllState} onChange={(e) => toggleAllSelection(e.target.checked)} />{" "}
                    Selecionar todos
                </div>
            </div>

            <div className={styles.transactionsWrapper}>
                <Table columns={columns} dataSource={dataSource} pagination={false} rowKey="id" />
            </div>
        </div>
    );
}
