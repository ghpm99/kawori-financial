"use client";

import { ResolvedImports, useCsvImportProvider } from "@/components/providers/csvImport";
import { ITags } from "@/components/providers/tags";
import { formatMoney } from "@/util";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Progress, Table, Tag } from "antd";

export default function ConfirmStep() {
    const { isProcessing, importProgress, stats, handleCloseModal, resolvedImportsWithoutTag } = useCsvImportProvider();

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
                    {resolvedImportsWithoutTag?.length > 0 ? (
                        <>
                            <Table
                                columns={[
                                    { title: "Nome", dataIndex: ["name"], key: "name" },
                                    {
                                        title: "Valor",
                                        dataIndex: ["value"],
                                        key: "value",
                                        render: (value: number) => (
                                            <div style={{ fontWeight: 700 }}>
                                                {value != null ? formatMoney(value) : "-"}
                                            </div>
                                        ),
                                        width: 140,
                                    },
                                    {
                                        title: "Tags",
                                        dataIndex: ["tags"],
                                        key: "tags",
                                        render: (_: ITags[], { tags }: ResolvedImports) =>
                                            tags.map((tag) => (
                                                <Tag color={tag.color} key={`invoice-tags-${tag.id}`}>
                                                    {tag.name}
                                                </Tag>
                                            )),
                                    },
                                ]}
                                dataSource={resolvedImportsWithoutTag}
                                pagination={false}
                            />
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
                            <Button type="primary" onClick={handleCloseModal}>
                                Fechar
                            </Button>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
