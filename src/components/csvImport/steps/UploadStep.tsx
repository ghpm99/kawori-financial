// components/csv-import/steps/UploadStep.tsx
"use client";
import React from "react";
import { Button, Alert, Space } from "antd";
import { UploadOutlined, DownloadOutlined, FileOutlined } from "@ant-design/icons";
import styles from "../csv-import-modal.module.scss";
import { parseCSVText } from "../utils/csv";
import type { ImportType } from "../types";

interface Props {
    importType: ImportType;
    setImportType: (t: ImportType) => void;
    onFileParsed: (headers: string[], data: Record<string, string>[]) => void;
    csvCount: number;
    dragActive: boolean;
    setDragActive: (v: boolean) => void;
}

export default function UploadStep({
    importType,
    setImportType,
    onFileParsed,
    csvCount,
    dragActive,
    setDragActive,
}: Props) {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const onPick = (f?: File) => {
        if (!f) return;
        if (!f.name.endsWith(".csv")) {
            alert("Por favor selecione um arquivo CSV");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = String(e.target?.result ?? "");
            const { headers, data } = parseCSVText(text);
            onFileParsed(headers, data);
        };
        reader.readAsText(f);
    };

    return (
        <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 12 }}>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>Tipo de importação</div>
                <Space>
                    <Button
                        type={importType === "payments" ? "primary" : "default"}
                        onClick={() => setImportType("payments")}
                    >
                        Pagamentos / Movimentações
                    </Button>
                    <Button
                        type={importType === "invoices" ? "primary" : "default"}
                        onClick={() => setImportType("invoices")}
                    >
                        Faturas
                    </Button>
                </Space>
            </div>

            <div
                className={`${styles.uploadArea} ${dragActive ? styles.uploadActive : ""}`}
                onDragEnter={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(true);
                }}
                onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(true);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragActive(false);
                    if (e.dataTransfer?.files?.[0]) onPick(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    hidden
                    onChange={(e) => onPick(e.target.files?.[0])}
                />
                <FileOutlined style={{ fontSize: 36, marginBottom: 12 }} />
                <div style={{ fontSize: 16, fontWeight: 600 }}>Arraste e solte seu arquivo CSV aqui</div>
                <div style={{ marginTop: 8, color: "var(--ant-text-color-secondary)" }}>
                    ou clique para selecionar um arquivo
                </div>
                <div style={{ marginTop: 12 }}>
                    <Button icon={<UploadOutlined />} type="dashed">
                        Selecionar arquivo
                    </Button>
                </div>
            </div>

            <Alert
                message="Dicas para importação"
                description={
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                        <li>O arquivo deve estar no formato CSV (vírgula ou ponto-e-vírgula)</li>
                        <li>A primeira linha deve conter os cabeçalhos</li>
                        <li>Datas: DD/MM/AAAA ou AAAA-MM-DD</li>
                        <li>Valores podem ter vírgula ou ponto</li>
                    </ul>
                }
                type="info"
                showIcon
                className={styles.infoAlert}
            />

            <div style={{ marginTop: 12 }} className={styles.sampleRow}>
                <div>
                    <div style={{ fontWeight: 600 }}>Precisa de um modelo?</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>Baixe nosso template CSV</div>
                </div>
                <Button icon={<DownloadOutlined />} type="default">
                    Baixar template
                </Button>
            </div>

            <div style={{ marginTop: 12 }}>
                <div style={{ color: "var(--ant-text-color-secondary)" }}>{csvCount} registros carregados</div>
            </div>
        </div>
    );
}
