"use client";

import { useCsvImportProvider } from "@/components/providers/csvImport";
import { formatMoney, formatterDate } from "@/util";
import { ArrowRightOutlined, LinkOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Checkbox, Select } from "antd";
import styles from "../steps/steps.module.scss";

const { Option } = Select;

export default function ReconciliationStep() {
    const { importType, parsedTransactions, filteredTransactions, showOnlyMatches, setShowOnlyMatches, linkPayment } =
        useCsvImportProvider();
    const matchedCount = parsedTransactions.filter((t) => t?.possibly_matched_payment_list?.length > 0).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "620px" }}>
            <Alert
                message="Reconciliação de Pagamentos"
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
                <div style={{ marginLeft: "auto" }}>{matchedCount} correspondências encontradas</div>
            </div>

            <div style={{ overflow: "auto", padding: 12 }}>
                {filteredTransactions
                    .filter((t) => t.is_valid)
                    .map((transaction) => (
                        <Card
                            key={transaction.id}
                            className={styles.reconciliationCard}
                            style={
                                transaction.matched_payment
                                    ? { borderColor: "#bae7ff", background: "rgba(186,231,255,0.12)" }
                                    : undefined
                            }
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: "var(--ant-text-color-secondary)" }}>
                                        Transação importada
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{transaction.mapped_data.name}</div>
                                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                        {formatterDate(transaction.mapped_data.date || "")} •{" "}
                                        <span
                                            style={{
                                                color: transaction.mapped_data.type === 0 ? "#237804" : "#a8071a",
                                            }}
                                        >
                                            {formatMoney(transaction.mapped_data.value || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ width: 64, textAlign: "center" }}>
                                    {transaction.matched_payment ? (
                                        <div>
                                            <LinkOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                                            <div style={{ fontSize: 12, color: "#1890ff" }}>
                                                {transaction.match_score ?? 0}%
                                            </div>
                                        </div>
                                    ) : (
                                        <ArrowRightOutlined
                                            style={{ fontSize: 20, color: "var(--ant-text-color-secondary)" }}
                                        />
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
                                                {formatterDate(transaction.matched_payment.date)} •{" "}
                                                {formatMoney(transaction.matched_payment.value)}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                            Será criado como novo pagamento
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: 8 }}>
                                    {transaction.matched_payment ? (
                                        <Button
                                            onClick={() => linkPayment(transaction.id, undefined)}
                                            icon={<LinkOutlined />}
                                        >
                                            Desvincular
                                        </Button>
                                    ) : (
                                        <Select
                                            style={{ width: 220 }}
                                            placeholder="Vincular a..."
                                            onChange={(paymentId) => {
                                                const p = transaction.possibly_matched_payment_list.find(
                                                    (pp) => pp.id === paymentId,
                                                );
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
                    ))}
            </div>
        </div>
    );
}
