// components/csv-import/CsvImportModal.tsx
"use client";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, Steps, Button, Checkbox } from "antd";
import {
    UploadOutlined,
    LinkOutlined,
    FileOutlined,
    ReloadOutlined,
    CheckOutlined,
    LeftOutlined,
    RightOutlined,
} from "@ant-design/icons";

import UploadStep from "./steps/UploadStep";
import MappingStep from "./steps/MappingStep";
import PreviewStep from "./steps/PreviewStep";
import ReconciliationStep from "./steps/ReconciliationStep";
import ConfirmStep from "./steps/ConfirmStep";

import { parseCSVText, parseDateToISO } from "./utils/csv";

import { CSVRow, ParsedTransaction, ColumnMapping, ImportType, ImportStep } from "./types";
import styles from "./csv-import-modal.module.scss";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultType?: ImportType;
}

export default function CsvImportModal({ open, onOpenChange, defaultType = "payments" }: Props) {
    const [step, setStep] = useState<ImportStep>("upload");
    const [importType, setImportType] = useState<ImportType>(defaultType);
    const [fileData, setFileData] = useState<{ headers: string[]; data: CSVRow[] } | null>(null);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlyMatches, setShowOnlyMatches] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const resetState = useCallback(() => {
        setStep("upload");
        setFileData(null);
        setColumnMappings([]);
        setParsedTransactions([]);
        setIsProcessing(false);
        setImportProgress(0);
        setSearchTerm("");
        setShowOnlyMatches(false);
    }, []);

    const handleClose = useCallback(() => {
        resetState();
        onOpenChange(false);
    }, [onOpenChange, resetState]);

    // file parsed from UploadStep
    const handleFileParsed = useCallback((headers: string[], data: CSVRow[]) => {
        setFileData({ headers, data });
        // auto-mapping
        const auto = headers.map((header) => {
            const lh = header.toLowerCase();
            let systemField = "ignore";
            if (lh.includes("descri") || lh.includes("desc")) systemField = "description";
            else if (lh.includes("valor") || lh.includes("amount") || lh.includes("value")) systemField = "amount";
            else if (lh.includes("data") || lh.includes("date")) systemField = "date";
            else if (lh.includes("método") || lh.includes("method") || lh.includes("forma")) systemField = "method";
            else if (lh.includes("tipo") || lh.includes("type")) systemField = "type";
            else if (lh.includes("referência") || lh.includes("reference") || lh.includes("ref"))
                systemField = "reference";
            else if (lh.includes("status")) systemField = "status";
            else if (lh.includes("cliente") || lh.includes("client")) systemField = "clientName";
            else if (lh.includes("email")) systemField = "clientEmail";
            else if (lh.includes("vencimento") || lh.includes("due")) systemField = "dueDate";
            else if (lh.includes("total")) systemField = "total";
            return { csvColumn: header, systemField };
        });
        setColumnMappings(auto);
        setStep("mapping");
    }, []);

    const updateMapping = useCallback((csvColumn: string, systemField: string) => {
        setColumnMappings((prev) => prev.map((m) => (m.csvColumn === csvColumn ? { ...m, systemField } : m)));
    }, []);

    // process transactions (mapping -> parsedTransactions)
    const processTransactions = useCallback(() => {
        if (!fileData) return;
        setIsProcessing(true);
        const txs: ParsedTransaction[] = fileData.data.map((row, idx) => {
            const mapped: any = {};
            const errors: string[] = [];

            columnMappings.forEach((m) => {
                if (m.systemField === "ignore") return;
                const val = row[m.csvColumn] ?? "";
                if (m.systemField === "amount") {
                    const num = Number.parseFloat(val.replace(/[^\d.,-]/g, "").replace(",", "."));
                    if (isNaN(num)) errors.push(`Valor inválido: ${val}`);
                    else {
                        mapped.amount = Math.abs(num);
                        if (num < 0) mapped.type = "expense";
                    }
                } else if (m.systemField === "date") {
                    const ds = parseDateToISO(val);
                    if (!ds) errors.push(`Data inválida: ${val}`);
                    else mapped.date = ds;
                } else if (m.systemField === "type") {
                    const lv = String(val).toLowerCase();
                    if (lv.includes("recei") || lv.includes("entrada") || lv.includes("income")) mapped.type = "income";
                    else if (
                        lv.includes("despe") ||
                        lv.includes("déb") ||
                        lv.includes("saída") ||
                        lv.includes("expense")
                    )
                        mapped.type = "expense";
                } else if (m.systemField === "method") {
                    const lv = String(val).toLowerCase();
                    if (lv.includes("pix")) mapped.method = "pix";
                    else if (lv.includes("cartão") || lv.includes("card") || lv.includes("crédito"))
                        mapped.method = "credit_card";
                    else if (lv.includes("transfer") || lv.includes("ted") || lv.includes("doc"))
                        mapped.method = "bank_transfer";
                    else if (lv.includes("dinheiro") || lv.includes("cash")) mapped.method = "cash";
                } else if (m.systemField === "status") {
                    const lv = String(val).toLowerCase();
                    if (lv.includes("pago") || lv.includes("paid")) mapped.status = "completed";
                    else if (lv.includes("pend") || lv.includes("aguard")) mapped.status = "pending";
                    else if (lv.includes("cancel")) mapped.status = "cancelled";
                    else if (lv.includes("fail")) mapped.status = "failed";
                } else {
                    (mapped as any)[m.systemField] = val;
                }
            });

            if (!mapped.description) errors.push("Descrição é obrigatória");
            if (!mapped.amount) errors.push("Valor é obrigatório");
            if (!mapped.date) errors.push("Data é obrigatória");

            if (!mapped.type) mapped.type = "expense";
            if (!mapped.method) mapped.method = "bank_transfer";
            if (!mapped.status) mapped.status = "completed";

            // match
            const { matchedPayment, matchScore } = findBestMatch(mapped, []);

            return {
                id: `import-${idx}`,
                originalRow: row,
                mappedData: mapped,
                validationErrors: errors,
                isValid: errors.length === 0,
                matchedPayment,
                matchScore,
                selected: errors.length === 0,
            } as ParsedTransaction;
        });

        setParsedTransactions(txs);
        setIsProcessing(false);
        setStep("preview");
    }, [columnMappings, fileData]);

    const findBestMatch = (mappedData: Partial<any>, existingPayments: any[]) => {
        if (!mappedData.amount || !mappedData.date) return {};
        let best: any | undefined;
        let bestScore = 0;
        for (const p of existingPayments) {
            let score = 0;
            const amountDiff = Math.abs(p.amount - (mappedData.amount ?? 0));
            if (amountDiff === 0) score += 50;
            else if (amountDiff < 1) score += 40;
            else if (amountDiff / p.amount < 0.01) score += 30;

            if (p.date === mappedData.date) score += 30;
            else {
                const dd = Math.abs(new Date(p.date).getTime() - new Date(mappedData.date ?? "").getTime());
                const days = dd / (1000 * 60 * 60 * 24);
                if (days <= 1) score += 20;
                else if (days <= 3) score += 10;
            }

            if (mappedData.description && p.description) {
                const d1 = String(mappedData.description).toLowerCase();
                const d2 = String(p.description).toLowerCase();
                if (d1.includes(d2) || d2.includes(d1)) score += 20;
            }

            if (mappedData.reference && p.reference && mappedData.reference === p.reference) score += 30;

            if (score > bestScore && score >= 50) {
                bestScore = score;
                best = p;
            }
        }
        return { matchedPayment: best, matchScore: bestScore };
    };

    // selection toggles
    const toggleSelection = useCallback((id: string) => {
        setParsedTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)));
    }, []);

    const toggleAllSelection = useCallback((selected: boolean) => {
        setParsedTransactions((prev) => prev.map((t) => ({ ...t, selected: t.isValid ? selected : false })));
    }, []);

    const linkPayment = useCallback((transactionId: string, payment?: any) => {
        setParsedTransactions((prev) =>
            prev.map((t) =>
                t.id === transactionId ? { ...t, matchedPayment: payment, matchScore: payment ? 100 : undefined } : t,
            ),
        );
    }, []);

    const handleImport = useCallback(async () => {
        setIsProcessing(true);
        setStep("confirm");
        const selectedTx = parsedTransactions.filter((t) => t.selected && t.isValid && !t.matchedPayment);
        const total = selectedTx.length;
        for (let i = 0; i < selectedTx.length; i++) {
            const tx = selectedTx[i];
            try {
                console.log({
                    amount: tx.mappedData.amount!,
                    date: tx.mappedData.date!,
                    description: tx.mappedData.description || "Imported transaction",
                    method: tx.mappedData.method || "bank_transfer",
                    status: tx.mappedData.status || "completed",
                    type: tx.mappedData.type || "expense",
                    reference: tx.mappedData.reference,
                });
            } catch (err) {
                console.error("Import error", err);
            }
            setImportProgress(((i + 1) / Math.max(total, 1)) * 100);
            await new Promise((r) => setTimeout(r, 50));
        }
        setIsProcessing(false);
    }, [parsedTransactions]);

    // filtered transactions for display
    const filteredTransactions = useMemo(() => {
        return parsedTransactions.filter((t) => {
            if (showOnlyMatches && !t.matchedPayment) return false;
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                return (
                    String(t.mappedData.description ?? "")
                        .toLowerCase()
                        .includes(s) ||
                    String(t.mappedData.reference ?? "")
                        .toLowerCase()
                        .includes(s) ||
                    String(t.mappedData.amount ?? "").includes(s)
                );
            }
            return true;
        });
    }, [parsedTransactions, searchTerm, showOnlyMatches]);

    const stats = useMemo(() => {
        const valid = parsedTransactions.filter((t) => t.isValid);
        const selected = parsedTransactions.filter((t) => t.selected);
        const matched = parsedTransactions.filter((t) => t.matchedPayment);
        const toImport = parsedTransactions.filter((t) => t.selected && t.isValid && !t.matchedPayment);
        return {
            total: parsedTransactions.length,
            valid: valid.length,
            invalid: parsedTransactions.length - valid.length,
            selected: selected.length,
            matched: matched.length,
            toImport: toImport.length,
        };
    }, [parsedTransactions]);

    const steps = [
        { key: "upload", label: "Upload", icon: <UploadOutlined /> },
        { key: "mapping", label: "Mapeamento", icon: <LinkOutlined /> },
        { key: "preview", label: "Preview", icon: <FileOutlined /> },
        { key: "reconciliation", label: "Reconciliação", icon: <ReloadOutlined /> },
        { key: "confirm", label: "Confirmar", icon: <CheckOutlined /> },
    ] as const;

    const currentIndex = steps.findIndex((s) => s.key === step);

    return (
        <Modal open={open} onCancel={handleClose} footer={null} width={920} bodyStyle={{ padding: 0 }}>
            <div className={styles.modalContent}>
                <div style={{ padding: 16 }}>
                    <div className={styles.headerTitle}>
                        <FileOutlined />
                        <div style={{ fontWeight: 700 }}>Importar Transações via CSV</div>
                    </div>
                    <div style={{ color: "var(--ant-text-color-secondary)" }}>
                        Importe faturas ou movimentações bancárias de um arquivo CSV.
                    </div>
                </div>

                <div className={styles.stepsRow}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        {steps.map((s, idx) => (
                            <div
                                key={s.key}
                                className={`${styles.stepPill} ${idx === currentIndex ? styles.stepActive : idx < currentIndex ? styles.stepCompleted : ""}`}
                            >
                                {idx < currentIndex ? <CheckOutlined /> : s.icon}
                                <span style={{ marginLeft: 8 }}>{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.content}>
                    {step === "upload" && (
                        <UploadStep
                            importType={importType}
                            setImportType={setImportType}
                            onFileParsed={(headers, data) => handleFileParsed(headers, data)}
                            csvCount={fileData?.data.length ?? 0}
                            dragActive={dragActive}
                            setDragActive={setDragActive}
                        />
                    )}

                    {step === "mapping" && fileData && (
                        <MappingStep
                            headers={fileData.headers}
                            csvSample={fileData.data}
                            mappings={columnMappings}
                            onUpdateMapping={updateMapping}
                            importType={importType}
                        />
                    )}

                    {step === "preview" && (
                        <PreviewStep
                            transactions={parsedTransactions}
                            filteredTransactions={filteredTransactions}
                            stats={stats}
                            toggleSelection={toggleSelection}
                            toggleAllSelection={toggleAllSelection}
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            selectAllState={stats.selected === stats.valid && stats.valid > 0}
                        />
                    )}

                    {step === "reconciliation" && (
                        <ReconciliationStep
                            transactions={parsedTransactions}
                            filteredTransactions={filteredTransactions}
                            payments={[]}
                            showOnlyMatches={showOnlyMatches}
                            setShowOnlyMatches={setShowOnlyMatches}
                            linkPayment={linkPayment}
                        />
                    )}

                    {step === "confirm" && (
                        <ConfirmStep
                            isProcessing={isProcessing}
                            importProgress={importProgress}
                            stats={{ toImport: stats.toImport, matched: stats.matched }}
                            onClose={handleClose}
                        />
                    )}
                </div>

                {/* Footer */}
                {step !== "confirm" && (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 12,
                            padding: 12,
                            borderTop: "1px solid var(--ant-border-color-base)",
                        }}
                    >
                        <Button
                            onClick={() => {
                                if (step === "upload") handleClose();
                                else {
                                    const prev = Math.max(0, currentIndex - 1);
                                    setStep(steps[prev].key as ImportStep);
                                }
                            }}
                        >
                            <LeftOutlined /> {step === "upload" ? "Cancelar" : "Voltar"}
                        </Button>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {step === "preview" && (
                                <div style={{ color: "var(--ant-text-color-secondary)", marginRight: 12 }}>
                                    {stats.toImport} transações serão importadas
                                </div>
                            )}

                            {step === "mapping" && (
                                <Button type="primary" onClick={processTransactions} disabled={isProcessing}>
                                    {isProcessing ? "Processando..." : "Processar dados"} <RightOutlined />
                                </Button>
                            )}

                            {step === "preview" && (
                                <Button type="primary" onClick={() => setStep("reconciliation")}>
                                    Reconciliar <RightOutlined />
                                </Button>
                            )}

                            {step === "reconciliation" && (
                                <Button type="primary" disabled={stats.toImport === 0} onClick={handleImport}>
                                    Importar {stats.toImport} transações <CheckOutlined />
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
