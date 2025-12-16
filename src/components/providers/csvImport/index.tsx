import { apiDjango } from "@/services";
import { faArrowRotateRight, faCheck, faFile, faLink, faListAlt, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { IPaymentDetail } from "../payments";

export type CSVRow = { [key: string]: string };

interface PaymentMatchCandidate {
    id: number;
    name: string;
    date: string;
    payment_date: string;
    value: number;
    score: number;
}
export interface ParsedTransaction {
    id: string;
    original_row: CSVRow;
    mapped_data: Partial<IPaymentDetail>;
    validation_errors: string[];
    is_valid: boolean;
    matched_payment?: PaymentMatchCandidate;
    match_score?: number;
    merge_group?: string;
    selected: boolean;
    possibly_matched_payment_list?: PaymentMatchCandidate[];
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

type ResolvedImports = {
    import_payment_id: number;
    reference: string;
    action: "merge" | "split" | "new";
    payment_id: number;
    name: string;
    value: number;
    date: string;
    payment_date: string;
    tags: number[];
    has_budget_tag: boolean;
};

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
    importType: ImportType;
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
    toggleSelectionTransactionsToMerge: (id: string) => void;
    linkPayment: (transactionId: string, payment?: PaymentMatchCandidate) => void;
    selectedTransactionsToMerge: string[];
    handleImport: () => Promise<void>;
    filteredTransactions: ParsedTransaction[];
    stats: { total: number; valid: number; invalid: number; selected: number; matched: number; toImport: number };
    searchTerm: string;
    setSearchTerm: (s: string) => void;
    showOnlyMatches: boolean;
    setShowOnlyMatches: (show: boolean) => void;
    selectAllState: boolean;
    mergePayments: () => void;
    unmergePayments: (mergeGroupId?: string) => void;
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
    const [selectedTransactionsToMerge, setSelectedTransactionsToMerge] = useState<string[]>([]);

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

    const { mutate: mutateProcessCsv, isPending: isPendingProcessCsv } = useMutation({
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

    const { mutate: mutateResolveImport } = useMutation({
        mutationFn: async ({ data }: { data: ParsedTransaction[] }) => {
            const response = await apiDjango.post<{
                data: ResolvedImports[];
            }>("/financial/payment/csv-resolve-imports/", {
                import: data.map((transaction) => ({
                    mapped_payment: transaction.mapped_data,
                    matched_payment_id: transaction.matched_payment?.id || null,
                    merge_group: transaction.merge_group || null,
                })),
            });
            return response.data;
        },
        onSuccess: (data) => {
            console.log("Resolved imports:", data);
            setStep("confirm");
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

    const toggleSelectionTransactionsToMerge = (id: string) => {
        setSelectedTransactionsToMerge((prev) =>
            prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
        );
    };

    const linkPayment = useCallback((transactionId: string, payment?: PaymentMatchCandidate) => {
        setParsedTransactions((prev) =>
            prev.map((t) =>
                t.id === transactionId
                    ? { ...t, matched_payment: payment, match_score: payment ? payment.score : undefined }
                    : t,
            ),
        );
    }, []);

    const mergePayments = useCallback(() => {
        const mergeGroup = uuidv4();
        setParsedTransactions((prev) =>
            prev.map((t) => (selectedTransactionsToMerge.includes(t.id) ? { ...t, merge_group: mergeGroup } : t)),
        );
        setSelectedTransactionsToMerge([]);
    }, [selectedTransactionsToMerge]);

    const unmergePayments = useCallback((mergeGroupId?: string) => {
        if (!mergeGroupId) return;
        setParsedTransactions((prev) =>
            prev.map((t) => (t.merge_group === mergeGroupId ? { ...t, merge_group: undefined } : t)),
        );
        setSelectedTransactionsToMerge([]);
    }, []);

    const handleImport = useCallback(async () => {
        mutateResolveImport({ data: parsedTransactions.filter((t) => t.selected && t.is_valid) });
    }, [mutateResolveImport, parsedTransactions]);

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
            if ((step === "reconciliation" && !t.selected) || !t.is_valid) return false;
            return true;
        });
    }, [parsedTransactions, searchTerm, showOnlyMatches, step]);

    const stats = useMemo(() => {
        const valid = parsedTransactions.filter((t) => t.is_valid);
        const selected = parsedTransactions.filter((t) => t.selected);
        const matched = parsedTransactions.filter((t) => t.matched_payment);
        const toImport = parsedTransactions.filter((t) => t.selected && t.is_valid);
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
    const isProcessing = isPendingProcessCsv;

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
        importType,
        handleSelectImportType,
        handleFileParsed,
        columnMappings,
        handleUpdateMapping,
        csvHeaders: fileData?.headers || [],
        csvDataSample: fileData?.data.slice(0, 3) || [],
        processTransactions,
        selectedTransactionsToMerge,
        parsedTransactions,
        isProcessing,
        importProgress,
        toggleSelection,
        toggleAllSelection,
        toggleSelectionTransactionsToMerge,
        linkPayment,
        handleImport,
        filteredTransactions,
        stats,
        searchTerm,
        setSearchTerm,
        showOnlyMatches,
        setShowOnlyMatches,
        selectAllState,
        mergePayments,
        unmergePayments,
    };

    return <CsvImportContext.Provider value={value}>{children}</CsvImportContext.Provider>;
};

export const useCsvImportProvider = (): CsvImportContextValue => {
    const ctx = useContext(CsvImportContext);
    if (!ctx) throw new Error("useCsvImportProvider must be used within CsvImportProvider");
    return ctx;
};
