"use client";

import { ResolvedImports, useCsvImportProvider } from "@/components/providers/csvImport";
import { ITags, useTags } from "@/components/providers/tags";
import { formatMoney } from "@/util";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Progress, Select, SelectProps, Table, Tag } from "antd";

type TagRender = SelectProps["tagRender"];

export default function ConfirmStep() {
    const { isProcessing, importProgress, stats, handleCloseModal, resolvedImportsWithoutTag, handleChangeTags } =
        useCsvImportProvider();
    const { data: tags, loading: isLoadingTags } = useTags();

    const tagRender: TagRender = (props) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const color = tags.find((tag) => tag.name === value)?.color || "blue";
        return (
            <Tag
                color={color}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{ marginInlineEnd: 4 }}
            >
                {label}
            </Tag>
        );
    };

    const tagsOptions = (tagSelection: ITags[]) => {
        const hasAlreadySelectedBudget =
            tags.filter((tag) => tagSelection.map((tag) => tag.name).includes(tag.name) && tag.is_budget).length > 0;

        return tags
            .filter((tag) => !tagSelection.map((tag) => tag.name).includes(tag.name))
            .map((tag) => ({
                ...tag,
                value: tag.name,
                label: tag.name,
                disabled: tag.is_budget && hasAlreadySelectedBudget,
            }));
    };

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
                                        render: (_: ITags[], { import_payment_id, tags }: ResolvedImports) => (
                                            <Select
                                                mode="multiple"
                                                style={{ width: "100%" }}
                                                placeholder="Etiquetas"
                                                data-testid="invoice-tags"
                                                onChange={(_, tags: ITags[]) =>
                                                    handleChangeTags(import_payment_id, tags)
                                                }
                                                value={tags.map((tag) => tag.name)}
                                                tagRender={tagRender}
                                                options={tagsOptions(tags)}
                                            />
                                        ),
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
