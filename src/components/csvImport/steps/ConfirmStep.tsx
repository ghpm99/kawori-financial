// components/csv-import/steps/ConfirmStep.tsx
"use client";
import React from "react";
import { Progress, Button } from "antd";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";

interface Props {
    isProcessing: boolean;
    importProgress: number;
    stats: { toImport: number; matched: number };
    onClose: () => void;
}

export default function ConfirmStep({ isProcessing, importProgress, stats, onClose }: Props) {
    return (
        <div style={{ padding: 24, textAlign: "center" }}>
            {isProcessing ? (
                <>
                    <LoadingOutlined style={{ fontSize: 48 }} spin />
                    <h3 style={{ marginTop: 12 }}>Importando transações...</h3>
                    <div style={{ width: 320, margin: "16px auto" }}>
                        <Progress percent={Math.round(importProgress)} />
                    </div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                        {Math.round(importProgress)}% concluído
                    </div>
                </>
            ) : (
                <>
                    <div
                        style={{
                            margin: "0 auto",
                            width: 80,
                            height: 80,
                            borderRadius: 40,
                            background: "#f6ffed",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CheckCircleOutlined style={{ fontSize: 36, color: "#237804" }} />
                    </div>
                    <h3 style={{ marginTop: 12 }}>Importação concluída!</h3>
                    <div style={{ color: "var(--ant-text-color-secondary)", marginBottom: 16 }}>
                        {stats.toImport} transações importadas.{" "}
                        {stats.matched > 0 && `${stats.matched} foram vinculadas.`}
                    </div>
                    <Button type="primary" onClick={onClose}>
                        Fechar
                    </Button>
                </>
            )}
        </div>
    );
}
