"use client";

import { PAYMENT_FIELDS, useCsvImportProvider } from "@/components/providers/csvImport";
import { Select, Table } from "antd";
import type { ColumnType } from "antd/es/table";
import styles from "../steps/steps.module.scss";

const { Option } = Select;

type DataSourceType = {
    key: string;
    csvColumn: string;
    sample: string;
    systemField: string;
};

export default function MappingStep() {
    const { columnMappings, handleUpdateMapping, csvHeaders, csvDataSample } = useCsvImportProvider();
    const columns: ColumnType<DataSourceType>[] = [
        { title: "Coluna do CSV", dataIndex: "csvColumn", key: "csvColumn", render: (v) => <strong>{v}</strong> },
        { title: "Amostra", dataIndex: "sample", key: "sample" },
        {
            title: "Campo do Sistema",
            dataIndex: "systemField",
            key: "systemField",
            render: (_: string, record: DataSourceType) => (
                <Select
                    value={record.systemField}
                    onChange={(value) => handleUpdateMapping(record.csvColumn, value)}
                    style={{ width: 220 }}
                >
                    {PAYMENT_FIELDS.map((f) => (
                        <Option value={f.value} key={f.value}>
                            {f.label} {f.required ? "*" : ""}
                        </Option>
                    ))}
                </Select>
            ),
        },
    ];

    const dataSource: DataSourceType[] = columnMappings.map((mapping) => ({
        key: mapping.csvColumn,
        csvColumn: mapping.csvColumn,
        sample: csvDataSample?.[0]?.[mapping.csvColumn] ?? "-",
        systemField: mapping.systemField,
    }));

    return (
        <div style={{ padding: 16 }}>
            <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700 }}>Mapeamento de Colunas</div>
                <div style={{ color: "var(--ant-text-color-secondary)" }}>
                    Associe as colunas do CSV aos campos do sistema
                </div>
            </div>

            <div className={styles.mappingTableWrap}>
                <Table columns={columns} dataSource={dataSource} pagination={false} />
            </div>

            <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Prévia dos dados (primeiras 3 linhas)</div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr>
                                {csvHeaders.map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: 8 }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {csvDataSample.map((row, i) => (
                                <tr key={i}>
                                    {csvHeaders.map((h) => (
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
