import { apiDjango } from "@/services";
import { faArrowRotateRight, faCheck, faFile, faLink, faListAlt, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { IPaymentDetail } from "../payments";

export type CSVRow = { [key: string]: string };

export interface ParsedTransaction {
    id: string;
    original_row: CSVRow;
    mapped_data: Partial<IPaymentDetail>;
    validation_errors: string[];
    is_valid: boolean;
    matched_payment?: IPaymentDetail;
    match_score?: number;
    selected: boolean;
    possibly_matched_payment_list?: IPaymentDetail[];
}

export interface ColumnMapping {
    csvColumn: string;
    systemField: string;
    readonly?: boolean;
}

export type ImportType = "transactions" | "card_payments";
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
    { value: "reference", label: "Referência" },
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
            const response = await apiDjango.post<{ data: { csv_column: string; system_field: string }[] }>(
                "/financial/payment/csv-mapping/",
                {
                    fileName: fileName,
                    headers: headers,
                },
            );
            return response.data;
        },
        onSuccess: (data) => {
            setColumnMappings(
                data.data.map((d) => ({
                    csvColumn: d.csv_column,
                    systemField: d.system_field,
                    readonly: d.system_field !== "ignore",
                })),
            );
            setStep("mapping");
        },
    });

    const { mutate: mutateProcessCsv, isPending: isPedingProcessCsv } = useMutation({
        mutationFn: async ({
            headers,
            data,
            importType,
        }: {
            headers: ColumnMapping[];
            data: CSVRow[];
            importType: ImportType;
        }) => {
            const response = await apiDjango.post<{
                data: ParsedTransaction[];
            }>("/financial/payment/process-csv/", {
                headers: headers.map((h) => ({ csv_column: h.csvColumn, system_field: h.systemField })),
                body: data,
                import_type: importType,
            });
            return response.data;
        },
        onSuccess: (data) => {
            setParsedTransactions(
                data.data.map((d) => ({
                    ...d,
                    selected: false,
                })),
            );
            setStep("preview");
        },
    });

    const resetState = useCallback(() => {
        setStep("type");
        setFileData(null);
        setColumnMappings([]);
        setParsedTransactions([]);
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
            mutateParseHeader({ fileName, headers });
        },
        [mutateParseHeader],
    );

    const handleUpdateMapping = useCallback((csvColumn: string, systemField: string) => {
        setColumnMappings((prev) => prev.map((m) => (m.csvColumn === csvColumn ? { ...m, systemField } : m)));
    }, []);

    const processTransactions = useCallback(() => {
        if (!fileData) return;

        mutateProcessCsv({ headers: columnMappings, data: fileData.data, importType });
    }, [columnMappings, fileData, importType, mutateProcessCsv]);

    const toggleSelection = useCallback((id: string) => {
        setParsedTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t)));
    }, []);

    const toggleAllSelection = useCallback((selected: boolean) => {
        setParsedTransactions((prev) => prev.map((t) => ({ ...t, selected: t.is_valid ? selected : false })));
    }, []);

    const linkPayment = useCallback((transactionId: string, payment?: IPaymentDetail) => {
        setParsedTransactions((prev) =>
            prev.map((t) =>
                t.id === transactionId ? { ...t, matched_payment: payment, matchScore: payment ? 100 : undefined } : t,
            ),
        );
    }, []);

    const handleImport = useCallback(async () => {
        setStep("confirm");
        const selectedTx = parsedTransactions.filter((t) => t.selected && t.is_valid && !t.matched_payment);
        const total = selectedTx.length;
        for (let i = 0; i < selectedTx.length; i++) {
            const tx = selectedTx[i];
            try {
                console.log({
                    amount: tx.mapped_data.value!,
                    date: tx.mapped_data.date!,
                    name: tx.mapped_data.name || "Imported transaction",
                    method: importType,
                    status: tx.mapped_data.status || "completed",
                    type: tx.mapped_data.type || "expense",
                });
            } catch (err) {
                console.error("Import error", err);
            }
            setImportProgress(((i + 1) / Math.max(total, 1)) * 100);
            await new Promise((r) => setTimeout(r, 50));
        }
    }, [importType, parsedTransactions]);

    const filteredTransactions = useMemo(() => {
        return parsedTransactions.filter((t) => {
            if (showOnlyMatches && !t.matched_payment) return false;
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                return (
                    String(t.mapped_data.name ?? "")
                        .toLowerCase()
                        .includes(s) ||
                    String(t.mapped_data.date ?? "")
                        .toLowerCase()
                        .includes(s) ||
                    String(t.mapped_data.value ?? "").includes(s)
                );
            }
            return true;
        });
    }, [parsedTransactions, searchTerm, showOnlyMatches]);

    const stats = useMemo(() => {
        const valid = parsedTransactions.filter((t) => t.is_valid);
        const selected = parsedTransactions.filter((t) => t.selected);
        const matched = parsedTransactions.filter((t) => t.matched_payment);
        const toImport = parsedTransactions.filter((t) => t.selected && t.is_valid && !t.matched_payment);
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
    const isProcessing = isPedingProcessCsv;

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
