// components/csv-import/steps/MappingStep.tsx
"use client";
import React from "react";
import { Table, Select } from "antd";
import type { ColumnType } from "antd/es/table";
import type { ColumnMapping, CSVRow, ImportType } from "../types";
import styles from "../csv-import-modal.module.scss";

const { Option } = Select;

interface FieldOption {
    value: string;
    label: string;
    required?: boolean;
}

const PAYMENT_FIELDS: FieldOption[] = [
    { value: "description", label: "Descrição", required: true },
    { value: "amount", label: "Valor", required: true },
    { value: "date", label: "Data", required: true },
    { value: "method", label: "Método" },
    { value: "type", label: "Tipo" },
    { value: "reference", label: "Referência" },
    { value: "status", label: "Status" },
    { value: "ignore", label: "Ignorar coluna" },
];

const INVOICE_FIELDS: FieldOption[] = [
    { value: "clientName", label: "Nome do Cliente", required: true },
    { value: "clientEmail", label: "Email do Cliente" },
    { value: "date", label: "Data", required: true },
    { value: "dueDate", label: "Data de Vencimento", required: true },
    { value: "total", label: "Valor Total", required: true },
    { value: "status", label: "Status" },
    { value: "ignore", label: "Ignorar coluna" },
];

interface Props {
    headers: string[];
    csvSample: CSVRow[];
    mappings: ColumnMapping[];
    onUpdateMapping: (csvColumn: string, systemField: string) => void;
    importType: ImportType;
}

export default function MappingStep({ headers, csvSample, mappings, onUpdateMapping, importType }: Props) {
    const fields = importType === "payments" ? PAYMENT_FIELDS : INVOICE_FIELDS;

    const columns: ColumnType<any>[] = [
        { title: "Coluna do CSV", dataIndex: "csvColumn", key: "csvColumn", render: (v) => <strong>{v}</strong> },
        { title: "Amostra", dataIndex: "sample", key: "sample" },
        {
            title: "Campo do Sistema",
            dataIndex: "systemField",
            key: "systemField",
            render: (_: any, rec: any) => (
                <Select
                    value={rec.systemField}
                    onChange={(value) => onUpdateMapping(rec.csvColumn, value)}
                    style={{ width: 220 }}
                >
                    {fields.map((f) => (
                        <Option value={f.value} key={f.value}>
                            {f.label} {f.required ? "*" : ""}
                        </Option>
                    ))}
                </Select>
            ),
        },
    ];

    const dataSource = mappings.map((m) => ({
        key: m.csvColumn,
        csvColumn: m.csvColumn,
        sample: csvSample?.[0]?.[m.csvColumn] ?? "-",
        systemField: m.systemField,
    }));

    return (
        <div style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>Mapeamento de Colunas</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                        Associe as colunas do CSV aos campos do sistema
                    </div>
                </div>
                <div style={{ alignSelf: "center" }}>{mappings.length} colunas</div>
            </div>

            <Table columns={columns} dataSource={dataSource} pagination={false} className={styles.mappingTable} />

            <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Prévia dos dados (primeiras 3 linhas)</div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {headers.map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: 8 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {csvSample.slice(0, 3).map((row, i) => (
                                <tr key={i}>
                                    {headers.map((h) => (
                                        <td key={h} style={{ padding: 8, whiteSpace: "nowrap" }}>
                                            {row[h] ?? "-"}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
