import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { IPaymentDetail } from "../payments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRotateRight, faCheck, faFile, faLink, faListAlt, faUpload } from "@fortawesome/free-solid-svg-icons";
import { parseDateToISO } from "@/components/csvImport/utils/csv";
import { useMutation } from "@tanstack/react-query";
import { apiDjango } from "@/services";

export type CSVRow = { [key: string]: string };

export interface ParsedTransaction {
    id: string;
    originalRow: CSVRow;
    mappedData: Partial<IPaymentDetail>;
    validationErrors: string[];
    isValid: boolean;
    matchedPayment?: IPaymentDetail;
    matchScore?: number;
    selected: boolean;
    possiblyMatchedPaymentList?: IPaymentDetail[];
}

export interface ColumnMapping {
    csvColumn: string;
    systemField: string;
}

export type ImportType = "transactions" | "invoices";
export type ImportStep = "type" | "upload" | "mapping" | "preview" | "reconciliation" | "confirm";

export type Step = {
    key: ImportStep;
    title: string;
    icon: React.ReactNode;
};

type FieldOption = { value: string; label: string; required?: boolean };

export const PAYMENT_FIELDS: FieldOption[] = [
    { value: "name", label: "Nome" },
    { value: "date", label: "Data", required: true },
    { value: "installments", label: "Parcelas" },
    { value: "payment_date", label: "Data de Pagamento" },
    { value: "value", label: "Valor", required: true },
    { value: "description", label: "Descrição" },
    { value: "ignore", label: "Ignorar coluna" },
];

type CsvImportContextValue = {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
    handleCloseModal: () => void;
    dragActive: boolean;
    setDragActive: (active: boolean) => void;
    step: ImportStep;
    steps: Step[];
    currentStepIndex: number;
    totalDataLoaded: number;
    goToStep: (stepKey: ImportStep) => void;
    goToPreviousStep: () => void;
    handleSelectImportType: (type: ImportType) => void;
    handleFileParsed: (fileName: string, headers: string[], data: CSVRow[]) => void;
    columnMappings: ColumnMapping[];
    handleUpdateMapping: (csvColumn: string, systemField: string) => void;
    csvHeaders: string[];
    csvDataSample: CSVRow[];
    processTransactions: () => void;
    parsedTransactions: ParsedTransaction[];
    isProcessing: boolean;
    importProgress: number;
    toggleSelection: (id: string) => void;
    toggleAllSelection: (selected: boolean) => void;
    linkPayment: (transactionId: string, payment?: IPaymentDetail) => void;
    handleImport: () => Promise<void>;
    filteredTransactions: ParsedTransaction[];
    stats: { total: number; valid: number; invalid: number; selected: number; matched: number; toImport: number };
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    showOnlyMatches: boolean;
    setShowOnlyMatches: (show: boolean) => void;
    selectAllState: boolean;
};

const CsvImportContext = createContext<CsvImportContextValue | undefined>(undefined);

export const FIRST_STEP: ImportStep = "type";

export const CsvImportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // State
    const [openModal, setOpenModal] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [step, setStep] = useState<ImportStep>(FIRST_STEP);
    const [importType, setImportType] = useState<ImportType>("transactions");
    const [fileData, setFileData] = useState<{ fileName: string; headers: string[]; data: CSVRow[] } | null>(null);
    const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
    const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [importProgress, setImportProgress] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [showOnlyMatches, setShowOnlyMatches] = useState(false);

    const steps: Step[] = [
        { key: "type", title: "Tipo", icon: <FontAwesomeIcon icon={faListAlt} /> },
        { key: "upload", title: "Upload", icon: <FontAwesomeIcon icon={faUpload} /> },
        { key: "mapping", title: "Mapeamento", icon: <FontAwesomeIcon icon={faLink} /> },
        { key: "preview", title: "Preview", icon: <FontAwesomeIcon icon={faFile} /> },
        { key: "reconciliation", title: "Reconciliação", icon: <FontAwesomeIcon icon={faArrowRotateRight} /> },
        { key: "confirm", title: "Confirmar", icon: <FontAwesomeIcon icon={faCheck} /> },
    ];

    const currentStepIndex = steps.findIndex((s) => s.key === step);
    const totalDataLoaded = fileData ? fileData.data.length : 0;

    const { mutate: mutateParseHeader } = useMutation({
        mutationFn: async ({ fileName, headers }: { fileName: string; headers: string[] }) => {
            const response = await apiDjango.post("/financial/payment/csv-mapping/", {
                fileName: fileName,
                headers: headers,
            });
            return response.data;
        },
    });

    const resetState = useCallback(() => {
        setStep("type");
        setFileData(null);
        setColumnMappings([]);
        setParsedTransactions([]);
        setIsProcessing(false);
        setImportProgress(0);
        setSearchTerm("");
        setShowOnlyMatches(false);
        setDragActive(false);
    }, []);

    const handleCloseModal = () => {
        resetState();
        setOpenModal(false);
    };

    const goToStep = (stepKey: ImportStep) => {
        setStep(stepKey);
    };

    const goToPreviousStep = () => {
        if (step === FIRST_STEP) {
            handleCloseModal();
            return;
        }

        const prev = Math.max(0, currentStepIndex - 1);
        setStep(steps[prev].key as ImportStep);
    };

    const handleSelectImportType = (type: ImportType) => {
        setImportType(type);
        setStep("upload");
    };

    const handleFileParsed = useCallback(
        (fileName: string, headers: string[], data: CSVRow[]) => {
            setFileData({ fileName, headers, data });
            // TODO ajustar para uma mutation de mapeamento automática mais inteligente
            const auto = headers.map((h) => {
                const lh = h.toLowerCase();
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
                return { csvColumn: h, systemField };
            });
            mutateParseHeader({ fileName, headers });
            setColumnMappings(auto);
            setStep("mapping");
        },
        [mutateParseHeader],
    );

    const handleUpdateMapping = useCallback((csvColumn: string, systemField: string) => {
        setColumnMappings((prev) => prev.map((m) => (m.csvColumn === csvColumn ? { ...m, systemField } : m)));
    }, []);

    const findBestMatch = useCallback((mappedData: Partial<any>, existingPayments: any[]) => {
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
    }, []);

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
    }, [columnMappings, fileData, findBestMatch]);

    const toggleSelection = useCallback((id: string) => {
        setParsedTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)));
    }, []);

    const toggleAllSelection = useCallback((selected: boolean) => {
        setParsedTransactions((prev) => prev.map((t) => ({ ...t, selected: t.isValid ? selected : false })));
    }, []);

    const linkPayment = useCallback((transactionId: string, payment?: IPaymentDetail) => {
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
                    amount: tx.mappedData.value!,
                    date: tx.mappedData.date!,
                    name: tx.mappedData.name || "Imported transaction",
                    method: importType,
                    status: tx.mappedData.status || "completed",
                    type: tx.mappedData.type || "expense",
                });
            } catch (err) {
                console.error("Import error", err);
            }
            setImportProgress(((i + 1) / Math.max(total, 1)) * 100);
            await new Promise((r) => setTimeout(r, 50));
        }
        setIsProcessing(false);
    }, [importType, parsedTransactions]);

    const filteredTransactions = useMemo(() => {
        return parsedTransactions.filter((t) => {
            if (showOnlyMatches && !t.matchedPayment) return false;
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                return (
                    String(t.mappedData.name ?? "")
                        .toLowerCase()
                        .includes(s) ||
                    String(t.mappedData.date ?? "")
                        .toLowerCase()
                        .includes(s) ||
                    String(t.mappedData.value ?? "").includes(s)
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

    const selectAllState = stats.selected === stats.valid && stats.valid > 0;

    const value: CsvImportContextValue = {
        openModal,
        setOpenModal,
        handleCloseModal,
        dragActive,
        setDragActive,
        step,
        steps,
        currentStepIndex,
        totalDataLoaded,
        goToPreviousStep,
        goToStep,
        handleSelectImportType,
        handleFileParsed,
        columnMappings,
        handleUpdateMapping,
        csvHeaders: fileData?.headers || [],
        csvDataSample: fileData?.data.slice(0, 3) || [],
        processTransactions,
        parsedTransactions,
        isProcessing,
        importProgress,
        toggleSelection,
        toggleAllSelection,
        linkPayment,
        handleImport,
        filteredTransactions,
        stats,
        searchTerm,
        setSearchTerm,
        showOnlyMatches,
        setShowOnlyMatches,
        selectAllState,
    };

    return <CsvImportContext.Provider value={value}>{children}</CsvImportContext.Provider>;
};

export const useCsvImportProvider = (): CsvImportContextValue => {
    const ctx = useContext(CsvImportContext);
    if (!ctx) throw new Error("useCsvImportProvider must be used within CsvImportProvider");
    return ctx;
};
