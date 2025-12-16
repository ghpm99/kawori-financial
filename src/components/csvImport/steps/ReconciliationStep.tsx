"use client";

import { ParsedTransaction, useCsvImportProvider } from "@/components/providers/csvImport";
import { formatMoney, formatterDate } from "@/util";
import { ArrowRightOutlined, LinkOutlined } from "@ant-design/icons";
import { faLink, faUnlink } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Alert, Button, Card, Checkbox, Select } from "antd";
import styles from "../steps/steps.module.scss";

const { Option } = Select;

export default function ReconciliationStep() {
    const {
        selectedTransactionsToMerge,
        toggleSelectionTransactionsToMerge,
        importType,
        filteredTransactions,
        showOnlyMatches,
        setShowOnlyMatches,
        linkPayment,
        mergePayments,
        unmergePayments,
    } = useCsvImportProvider();
    const matchedCount = filteredTransactions.filter((t) => t?.possibly_matched_payment_list?.length > 0).length;
    const sortedTransactions = filteredTransactions.sort((a, b) =>
        (b.merge_group ?? "").localeCompare(a.merge_group ?? ""),
    );

    const RenderCard = (transaction: ParsedTransaction) => (
        <Card
            className={`${styles.reconciliationCard} ${transaction.matched_payment ? styles["matched"] : ""} ${transaction.merge_group ? styles["merged"] : ""}`}
        >
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Checkbox
                    disabled={!!transaction.merge_group}
                    checked={selectedTransactionsToMerge.includes(transaction.id)}
                    onChange={() => toggleSelectionTransactionsToMerge(transaction.id)}
                />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: "var(--ant-text-color-secondary)" }}>Transação importada</div>
                    <div style={{ fontWeight: 700 }}>{transaction.mapped_data.name}</div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                        Pagamento: {formatterDate(transaction.mapped_data.date || "")} •{" "}
                        <span
                            style={{
                                color: transaction.mapped_data.type === 0 ? "#237804" : "#a8071a",
                            }}
                        >
                            {formatMoney(transaction.mapped_data.value || 0)}
                        </span>
                        <div>Data: {formatterDate(transaction.mapped_data.date || "")}</div>
                    </div>
                </div>

                <div style={{ width: 64, textAlign: "center" }}>
                    {transaction.matched_payment ? (
                        <div>
                            <LinkOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                            <div style={{ fontSize: 12, color: "#1890ff" }}>{transaction.match_score ?? 0}%</div>
                        </div>
                    ) : (
                        <ArrowRightOutlined style={{ fontSize: 20, color: "var(--ant-text-color-secondary)" }} />
                    )}
                </div>

                <div style={{ flex: 1 }}>
                    {transaction.matched_payment ? (
                        <>
                            <div style={{ fontSize: 12, color: "var(--ant-text-color-secondary)" }}>
                                Pagamento existente
                            </div>
                            <div style={{ fontWeight: 700 }}>{transaction.matched_payment.name}</div>
                            <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                Pagamento: {formatterDate(transaction.matched_payment.payment_date)} •{" "}
                                {formatMoney(transaction.matched_payment.value)}
                                <div>Data: {formatterDate(transaction.matched_payment.date)}</div>
                            </div>
                        </>
                    ) : (
                        <div style={{ color: "var(--ant-text-color-secondary)" }}>Será criado como novo pagamento</div>
                    )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                    {transaction.matched_payment ? (
                        <Button onClick={() => linkPayment(transaction.id, undefined)} icon={<LinkOutlined />}>
                            Desvincular
                        </Button>
                    ) : (
                        <Select
                            style={{ width: 220 }}
                            placeholder="Vincular a..."
                            onChange={(paymentId) => {
                                const p = transaction.possibly_matched_payment_list.find((pp) => pp.id === paymentId);
                                linkPayment(transaction.id, p);
                            }}
                            allowClear
                        >
                            {transaction.possibly_matched_payment_list?.map((p) => (
                                <Option key={p.id} value={p.id}>
                                    {importType === "card_payments"
                                        ? formatterDate(p.date)
                                        : formatterDate(p.payment_date)}{" "}
                                    - {p.name} - {formatMoney(p.value)}
                                </Option>
                            ))}
                        </Select>
                    )}
                </div>
            </div>
        </Card>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "620px" }}>
            <Alert
                title="Reconciliação de Pagamentos"
                description={`Encontramos ${matchedCount} possíveis correspondências com pagamentos existentes.`}
                type="info"
                showIcon
                style={{ margin: 12 }}
            />

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderBottom: "1px solid var(--ant-border-color-base)",
                }}
            >
                <Checkbox checked={showOnlyMatches} onChange={(e) => setShowOnlyMatches(e.target.checked)}>
                    Mostrar apenas correspondências
                </Checkbox>
                <Button
                    type="primary"
                    disabled={selectedTransactionsToMerge.length < 2}
                    icon={<FontAwesomeIcon icon={faLink} />}
                    onClick={mergePayments}
                >
                    Unificar pagamentos ({selectedTransactionsToMerge.length} selecionados)
                </Button>
                <div style={{ marginLeft: "auto" }}>{matchedCount} correspondências encontradas</div>
            </div>

            <div style={{ overflow: "auto", padding: 12 }}>
                {sortedTransactions.map((transaction, index) => {
                    const nextTransaction = sortedTransactions[index + 1];
                    const isGroupedWithNext =
                        transaction.merge_group &&
                        nextTransaction &&
                        transaction.merge_group === nextTransaction.merge_group;
                    return (
                        <div key={transaction.id} className={styles["transaction-item"]}>
                            <RenderCard {...transaction} />
                            {isGroupedWithNext && (
                                <div className={styles["merge-separator"]}>
                                    <Button
                                        type="dashed"
                                        icon={
                                            <FontAwesomeIcon
                                                icon={faUnlink}
                                                style={{ color: "#fa8c16", cursor: "pointer", fontSize: 18 }}
                                                title="Desagrupar pagamentos"
                                            />
                                        }
                                        onClick={() => unmergePayments(transaction.merge_group)}
                                    >
                                        Desagrupar
                                    </Button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
