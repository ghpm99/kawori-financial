// components/csv-import/steps/ReconciliationStep.tsx
"use client";
import React from "react";
import { Card, Select, Button, Alert, Checkbox } from "antd";
import { LinkOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type { ParsedTransaction } from "../types";
import styles from "../steps/steps.module.scss";
import { formatMoney, formatterDate } from "@/util";

const { Option } = Select;

interface Props {
    transactions: ParsedTransaction[];
    filteredTransactions: ParsedTransaction[];
    payments: any[];
    showOnlyMatches: boolean;
    setShowOnlyMatches: (b: boolean) => void;
    linkPayment: (transactionId: string, payment?: any) => void;
}

export default function ReconciliationStep({
    transactions,
    filteredTransactions,
    payments,
    showOnlyMatches,
    setShowOnlyMatches,
    linkPayment,
}: Props) {
    const matchedCount = transactions.filter((t) => t.matchedPayment).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
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
                    .filter((t) => t.isValid)
                    .map((transaction) => (
                        <Card
                            key={transaction.id}
                            className={styles.reconciliationCard}
                            style={
                                transaction.matchedPayment
                                    ? { borderColor: "#bae7ff", background: "rgba(186,231,255,0.12)" }
                                    : undefined
                            }
                        >
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 12, color: "var(--ant-text-color-secondary)" }}>
                                        Transação importada
                                    </div>
                                    <div style={{ fontWeight: 700 }}>{transaction.mappedData.description}</div>
                                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                        {formatterDate(transaction.mappedData.date || "")} •{" "}
                                        <span
                                            style={{
                                                color: transaction.mappedData.type === "income" ? "#237804" : "#a8071a",
                                            }}
                                        >
                                            {formatMoney(transaction.mappedData.amount || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ width: 64, textAlign: "center" }}>
                                    {transaction.matchedPayment ? (
                                        <div>
                                            <LinkOutlined style={{ fontSize: 20, color: "#1890ff" }} />
                                            <div style={{ fontSize: 12, color: "#1890ff" }}>
                                                {transaction.matchScore ?? 0}%
                                            </div>
                                        </div>
                                    ) : (
                                        <ArrowRightOutlined
                                            style={{ fontSize: 20, color: "var(--ant-text-color-secondary)" }}
                                        />
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    {transaction.matchedPayment ? (
                                        <>
                                            <div style={{ fontSize: 12, color: "var(--ant-text-color-secondary)" }}>
                                                Pagamento existente
                                            </div>
                                            <div style={{ fontWeight: 700 }}>
                                                {transaction.matchedPayment.description}
                                            </div>
                                            <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                                {formatterDate(transaction.matchedPayment.date)} •{" "}
                                                {formatMoney(transaction.matchedPayment.amount)}
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: "var(--ant-text-color-secondary)" }}>
                                            Será criado como novo pagamento
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: 8 }}>
                                    {transaction.matchedPayment ? (
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
                                                const p = payments.find((pp) => pp.id === paymentId);
                                                linkPayment(transaction.id, p);
                                            }}
                                            allowClear
                                        >
                                            {payments.map((p) => (
                                                <Option key={p.id} value={p.id}>
                                                    {p.description} - {formatMoney(p.amount)}
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
