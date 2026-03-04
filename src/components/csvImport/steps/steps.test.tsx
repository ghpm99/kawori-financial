import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import dayjs from "dayjs";

const useCsvImportProviderMock = jest.fn();
const useTagsMock = jest.fn();
const alertMock = jest.fn();

global.alert = alertMock;

jest.mock("antd", () => {
    const Table = ({ columns, dataSource }: any) => {
        columns?.forEach((column: any) => {
            if (column.render && dataSource?.[0]) {
                const rendered = column.render(dataSource[0][column.dataIndex], dataSource[0]);
                const props = rendered?.props ?? {};
                if (typeof props.onChange === "function") {
                    if (props.mode === "multiple") {
                        props.onChange(["Budget"]);
                    } else {
                        props.onChange({ target: { checked: true } });
                    }
                }
            }
        });
        return <div>table</div>;
    };
    Table.Summary = {
        Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Cell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };

    const Select = ({ onChange, options, children }: any) => (
        <button onClick={() => onChange?.(options?.[0]?.value ?? children?.[0]?.props?.value ?? "value")}>select</button>
    );
    Select.Option = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    const Upload = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    Upload.LIST_IGNORE = "ignore";
    Upload.Dragger = ({ beforeUpload, onDragenter, onDragleave, onDrop }: any) => (
        <div>
            <button onClick={() => beforeUpload?.({ name: "file.csv" })}>upload-csv</button>
            <button onClick={() => beforeUpload?.({ name: "file.txt" })}>upload-txt</button>
            <button onClick={() => onDragenter?.()}>drag-enter</button>
            <button onClick={() => onDragleave?.()}>drag-leave</button>
            <button onClick={() => onDrop?.()}>drop</button>
        </div>
    );

    return {
        Alert: ({ title, description, children }: any) => <div>{title || description || children}</div>,
        Card: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
        Col: ({ children }: any) => <div>{children}</div>,
        Row: ({ children }: any) => <div>{children}</div>,
        Typography: {
            Title: ({ children }: any) => <div>{children}</div>,
            Paragraph: ({ children }: any) => <div>{children}</div>,
        },
        DatePicker: ({ onChange }: any) => <button onClick={() => onChange?.(dayjs("2026-03-10"))}>pick-date</button>,
        Button: ({ children, onClick, disabled }: any) => (
            <button onClick={onClick} disabled={disabled}>
                {children}
            </button>
        ),
        Upload,
        Select,
        Table,
        Checkbox: ({ checked, onChange, disabled }: any) => (
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(e) => onChange?.({ target: { checked: e.target.checked } })}
            />
        ),
        Input: {
            Search: ({ onChange }: any) => <input onChange={(e) => onChange?.(e)} />,
        },
        Tag: ({ children }: any) => <span>{children}</span>,
        Progress: () => <div>progress</div>,
    };
});

jest.mock("@/components/providers/csvImport", () => ({
    useCsvImportProvider: () => useCsvImportProviderMock(),
    PAYMENT_FIELDS: [
        { value: "value", label: "Valor", required: true },
        { value: "ignore", label: "Ignorar coluna" },
    ],
}));

jest.mock("@/components/providers/tags", () => ({
    useTags: () => useTagsMock(),
}));

jest.mock("../utils/csv", () => ({
    parseCSVText: () => ({ headers: ["Valor"], data: [{ Valor: "100" }] }),
}));

const SelectTypeStep = require("./SelectTypeStep").default;
const UploadStep = require("./UploadStep").default;
const MappingStep = require("./MappingStep").default;
const PreviewStep = require("./PreviewStep").default;
const ReconciliationStep = require("./ReconciliationStep").default;
const ConfirmStep = require("./ConfirmStep").default;

describe("csvImport steps", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        class FileReaderMock {
            onload: ((e: { target: { result: string } }) => void) | null = null;
            readAsText() {
                this.onload?.({ target: { result: "Valor\n100" } });
            }
        }
        (global as any).FileReader = FileReaderMock;
    });

    test("SelectTypeStep seleciona tipo e valida data para cartão", () => {
        const handleSelectImportType = jest.fn();
        const setPaymentDate = jest.fn();
        useCsvImportProviderMock.mockReturnValue({
            handleSelectImportType,
            paymentDate: null,
            setPaymentDate,
        });

        render(<SelectTypeStep />);
        fireEvent.click(screen.getByText(/Movimentações da Conta/i));
        expect(handleSelectImportType).toHaveBeenCalledWith("transactions");

        fireEvent.click(screen.getByText("pick-date"));
        fireEvent.click(screen.getByText(/Faturas Fechadas do Cartão/i));
        expect(setPaymentDate).toHaveBeenCalled();
    });

    test("UploadStep processa upload e eventos de drag", () => {
        const handleFileParsed = jest.fn();
        const setDragActive = jest.fn();
        useCsvImportProviderMock.mockReturnValue({
            handleFileParsed,
            totalDataLoaded: 0,
            dragActive: false,
            setDragActive,
        });

        render(<UploadStep />);
        fireEvent.click(screen.getByText("upload-csv"));
        fireEvent.click(screen.getByText("upload-txt"));
        fireEvent.click(screen.getByText("drag-enter"));
        fireEvent.click(screen.getByText("drag-leave"));
        fireEvent.click(screen.getByText("drop"));

        expect(handleFileParsed).toHaveBeenCalled();
        expect(alertMock).toHaveBeenCalled();
        expect(setDragActive).toHaveBeenCalled();
    });

    test("MappingStep renderiza mapeamento e atualiza campo", () => {
        const handleUpdateMapping = jest.fn();
        useCsvImportProviderMock.mockReturnValue({
            columnMappings: [{ csvColumn: "Valor", systemField: "value", readonly: false }],
            handleUpdateMapping,
            csvHeaders: ["Valor"],
            csvDataSample: [{ Valor: "100" }],
        });

        render(<MappingStep />);
        expect(handleUpdateMapping).toHaveBeenCalled();
    });

    test("PreviewStep renderiza dados e ações de seleção/filtro", () => {
        const toggleSelection = jest.fn();
        const toggleAllSelection = jest.fn();
        const setSearchTerm = jest.fn();
        useCsvImportProviderMock.mockReturnValue({
            filteredTransactions: [
                {
                    id: "1",
                    mapped_data: { description: "desc", date: "2026-03-01", value: 100, type: 1 },
                    validation_errors: ["erro"],
                    selected: false,
                    is_valid: true,
                },
            ],
            stats: { total: 1, valid: 1, invalid: 0, selected: 0 },
            toggleSelection,
            toggleAllSelection,
            searchTerm: "",
            setSearchTerm,
            selectAllState: false,
        });

        render(<PreviewStep />);
        fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
        fireEvent.click(screen.getAllByRole("checkbox")[0]);
        expect(setSearchTerm).toHaveBeenCalled();
        expect(toggleSelection).toHaveBeenCalled();
    });

    test("ReconciliationStep cobre vincular, desvincular, agrupar e filtros", () => {
        const toggleSelectionTransactionsToMerge = jest.fn();
        const setShowOnlyMatches = jest.fn();
        const linkPayment = jest.fn();
        const mergePayments = jest.fn();
        const unmergePayments = jest.fn();

        useCsvImportProviderMock.mockReturnValue({
            selectedTransactionsToMerge: ["1", "2"],
            toggleSelectionTransactionsToMerge,
            importType: "transactions",
            filteredTransactions: [
                {
                    id: "1",
                    mapped_data: { name: "A", payment_date: "2026-03-10", date: "2026-03-01", value: 100, type: 1 },
                    selected: true,
                    is_valid: true,
                    merge_group: "g1",
                    matched_payment: { id: 10, name: "M1", date: "2026-03-01", payment_date: "2026-03-10", value: 100, score: 95 },
                    match_score: 95,
                    isMatchedPaymentReadOnly: false,
                    possibly_matched_payment_list: [{ id: 10, name: "M1", date: "2026-03-01", payment_date: "2026-03-10", value: 100, score: 95 }],
                },
                {
                    id: "2",
                    mapped_data: { name: "B", payment_date: "2026-03-11", date: "2026-03-02", value: 200, type: 1 },
                    selected: true,
                    is_valid: true,
                    merge_group: "g1",
                    matched_payment: undefined,
                    isMatchedPaymentReadOnly: false,
                    possibly_matched_payment_list: [{ id: 11, name: "M2", date: "2026-03-02", payment_date: "2026-03-11", value: 200, score: 90 }],
                },
            ],
            showOnlyMatches: false,
            setShowOnlyMatches,
            linkPayment,
            mergePayments,
            unmergePayments,
        });

        render(<ReconciliationStep />);
        fireEvent.click(screen.getAllByRole("checkbox")[0]);
        fireEvent.click(screen.getByText(/Unificar pagamentos/i));
        fireEvent.click(screen.getByText(/Desagrupar/i));
        fireEvent.click(screen.getAllByText("select")[0]);
        fireEvent.click(screen.getByText(/Desvincular/i));

        expect(mergePayments).toHaveBeenCalled();
        expect(unmergePayments).toHaveBeenCalled();
        expect(linkPayment).toHaveBeenCalled();
    });

    test("ConfirmStep cobre loading, seleção de tags e sucesso", () => {
        const handleChangeTags = jest.fn();
        const handleConfirmImport = jest.fn();
        const handleCloseModal = jest.fn();

        useTagsMock.mockReturnValue({
            data: [{ id: 1, name: "Budget", color: "#fff", is_budget: true, total_closed: 0, total_open: 0, total_payments: 0, total_value: 0 }],
            loading: false,
        });

        useCsvImportProviderMock.mockReturnValue({
            isProcessing: false,
            stats: { toImport: 1, matched: 1 },
            handleCloseModal,
            resolvedImportsWithoutTag: [{ import_payment_id: 1 }],
            resolvedImportsToSelectTag: [
                {
                    import_payment_id: 1,
                    name: "Pagamento",
                    value: 100,
                    tags: [],
                    has_budget_tag: false,
                    isDirty: false,
                },
            ],
            handleChangeTags,
            handleConfirmImport,
        });

        const { rerender } = render(<ConfirmStep />);
        fireEvent.click(screen.getByText(/Concluir importação/i));
        expect(handleChangeTags).toHaveBeenCalled();

        useCsvImportProviderMock.mockReturnValue({
            isProcessing: false,
            stats: { toImport: 1, matched: 1 },
            handleCloseModal,
            resolvedImportsWithoutTag: [],
            resolvedImportsToSelectTag: [],
            handleChangeTags,
            handleConfirmImport,
        });
        rerender(<ConfirmStep />);
        fireEvent.click(screen.getByText(/Fechar/i));
        expect(handleCloseModal).toHaveBeenCalled();
    });
});
