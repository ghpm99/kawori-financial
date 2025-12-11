// components/csv-import/steps/UploadStep.tsx
"use client";
import React from "react";
import { Button, Alert, Space, Upload } from "antd";
import { UploadOutlined, DownloadOutlined, InboxOutlined, FileOutlined } from "@ant-design/icons";
import styles from "../steps/steps.module.scss";
import { parseCSVText } from "../utils/csv";
import type { ImportType } from "../types";
import { faDownload, faInbox, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const { Dragger } = Upload;

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
    const props = {
        name: "file",
        multiple: false,
        accept: ".csv",
        showUploadList: false,
        beforeUpload: (file: File) => {
            if (!file.name.endsWith(".csv")) {
                alert("Por favor selecione um arquivo CSV");
                return Upload.LIST_IGNORE;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = String(e.target?.result ?? "");
                const { headers, data } = parseCSVText(text);
                onFileParsed(headers, data);
            };
            reader.readAsText(file);
            return Upload.LIST_IGNORE;
        },
        onDragenter: () => setDragActive(true),
        onDragleave: () => setDragActive(false),
        onDrop: () => setDragActive(false),
    };

    return (
        <div style={{ padding: 16 }}>
            <Dragger
                {...props}
                height={200}
                className={`${styles.uploadArea} ${dragActive ? styles.uploadActive : ""}`}
            >
                <p className="ant-upload-drag-icon">
                    <FontAwesomeIcon icon={faInbox} style={{ fontSize: 36 }} />
                </p>
                <p style={{ fontWeight: 600 }}>Arraste e solte seu arquivo CSV aqui</p>
                <p style={{ color: "var(--ant-text-color-secondary)" }}>ou clique para selecionar um arquivo</p>
                <div style={{ marginTop: 12 }}>
                    <Button icon={<FontAwesomeIcon icon={faUpload} />}>Selecionar arquivo</Button>
                </div>
            </Dragger>

            <Alert
                type="info"
                showIcon
                style={{ marginTop: 12 }}
                message="Dicas para importação"
                description={
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                        <li>O arquivo deve estar no formato CSV (vírgula ou ponto-e-vírgula)</li>
                        <li>A primeira linha deve conter os cabeçalhos</li>
                        <li>Datas: DD/MM/AAAA ou AAAA-MM-DD</li>
                        <li>Valores podem ter vírgula ou ponto</li>
                    </ul>
                }
            />

            <div className={styles.sampleRow}>
                <div>
                    <div style={{ fontWeight: 700 }}>Precisa de um modelo?</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>Baixe nosso template CSV</div>
                </div>
                <Button icon={<FontAwesomeIcon icon={faDownload} />}>Baixar template</Button>
            </div>

            <div style={{ marginTop: 12, color: "var(--ant-text-color-secondary)" }}>
                {csvCount} registros carregados
            </div>
        </div>
    );
}
