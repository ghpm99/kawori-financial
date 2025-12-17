"use client";

import { ResolvedImports, useCsvImportProvider } from "@/components/providers/csvImport";
import { ITags, useTags } from "@/components/providers/tags";
import { formatMoney } from "@/util";
import { CheckCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { Button, Progress, Select, SelectProps, Table, Tag } from "antd";
import styles from "./steps.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

type TagRender = SelectProps["tagRender"];

export default function ConfirmStep() {
    const {
        isProcessing,
        importProgress,
        stats,
        handleCloseModal,
        resolvedImportsWithoutTag,
        resolvedImportsToSelectTag,
        handleChangeTags,
        handleConfirmImport,
    } = useCsvImportProvider();
    const { data: tagsQuery, loading: isLoadingTags } = useTags();

    const tagRender: TagRender = (props) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const color = tagsQuery.find((tag) => tag.name === value)?.color || "blue";
        return (
            <Tag
                color={color}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{ marginInlineEnd: 4 }}
                closeIcon={<FontAwesomeIcon className={styles["close-icon-tag"]} icon={faClose} />}
            >
                {label}
            </Tag>
        );
    };

    const tagsOptions = (tagSelection: ITags[]) => {
        const hasAlreadySelectedBudget =
            tagsQuery.filter((tag) => tagSelection.map((tag) => tag.name).includes(tag.name) && tag.is_budget).length >
            0;

        return tagsQuery
            .filter((tag) => !tagSelection.map((tag) => tag.name).includes(tag.name))
            .map((tag) => ({
                ...tag,
                value: tag.name,
                label: tag.name,
                disabled: tag.is_budget && hasAlreadySelectedBudget,
            }));
    };

    const findTagsByName = (tagsName: string[]) => {
        return tagsQuery.filter((tag) => tagsName.includes(tag.name));
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
                    {resolvedImportsToSelectTag?.length > 0 ? (
                        <div className={styles["confirm-card-select-tag"]}>
                            <h3 style={{ marginBottom: 4 }}>Classifique as transações</h3>

                            <div style={{ color: "var(--ant-text-color-secondary)", marginBottom: 16 }}>
                                Algumas transações ainda não possuem uma etiqueta de orçamento. Selecione uma etiqueta
                                para cada uma antes de concluir a importação.
                            </div>
                            <Table
                                scroll={{ x: "max-content", y: 340 }}
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
                                        title: (
                                            <>
                                                Tags
                                                <div style={{ fontSize: 12, color: "var(--ant-text-color-secondary)" }}>
                                                    Obrigatório
                                                </div>
                                            </>
                                        ),
                                        dataIndex: ["tags"],
                                        key: "tags",
                                        render: (_: ITags[], { import_payment_id, tags }: ResolvedImports) => (
                                            <Select
                                                mode="multiple"
                                                style={{ width: "100%" }}
                                                placeholder="Etiquetas"
                                                data-testid="invoice-tags"
                                                onChange={(value: string[]) =>
                                                    handleChangeTags(import_payment_id, findTagsByName(value))
                                                }
                                                value={tags.map((tag) => tag.name)}
                                                tagRender={tagRender}
                                                options={tagsOptions(tags)}
                                                loading={isLoadingTags}
                                            />
                                        ),
                                    },
                                ]}
                                dataSource={resolvedImportsToSelectTag}
                                pagination={false}
                            />
                            <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between" }}>
                                <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                    {resolvedImportsWithoutTag.length} transações aguardando classificação
                                </div>

                                <Button
                                    type="primary"
                                    disabled={resolvedImportsWithoutTag.length > 0}
                                    onClick={handleConfirmImport}
                                    title="Classifique todas as transações antes de concluir"
                                >
                                    Concluir importação
                                </Button>
                            </div>
                        </div>
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
