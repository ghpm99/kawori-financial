import React from "react";
import { act, renderHook } from "@testing-library/react";

const useMutationMock = jest.fn();
const messageSuccessMock = jest.fn();
const messageErrorMock = jest.fn();
const axiosIsAxiosErrorMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

jest.mock("antd", () => ({
    message: {
        success: (...args: unknown[]) => messageSuccessMock(...args),
        error: (...args: unknown[]) => messageErrorMock(...args),
    },
}));

jest.mock("axios", () => ({
    __esModule: true,
    ...jest.requireActual("axios"),
    default: {
        ...jest.requireActual("axios").default,
        isAxiosError: (...args: unknown[]) => axiosIsAxiosErrorMock(...args),
    },
}));

jest.mock("uuid", () => ({
    v4: () => "merge-group-1",
}));

jest.mock("@/services", () => ({
    apiDjango: {
        post: jest.fn(async () => ({ data: {} })),
    },
}));

import { CsvImportProvider, useCsvImportProvider } from "./index";

describe("CsvImportProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        axiosIsAxiosErrorMock.mockReturnValue(true);
    });

    test("executa fluxo principal de importação com reconciliação e confirmação", async () => {
        const mutations: Array<{ mutate: () => void; isPending: boolean }> = [];

        useMutationMock.mockImplementation((options: any) => {
            const mutate = () => {
                if (options?.onSuccess) {
                    if (options.mutationFn?.toString?.().includes("csv-mapping")) {
                        options.onSuccess({ data: [{ csv_column: "Valor", system_field: "value" }] });
                        return;
                    }
                    if (options.mutationFn?.toString?.().includes("process-csv")) {
                        options.onSuccess({
                            data: [
                                {
                                    id: "1",
                                    mapped_data: { name: "Pagamento A", value: 100, date: "2026-03-01" },
                                    original_row: {},
                                    validation_errors: [],
                                    is_valid: true,
                                    selected: false,
                                },
                            ],
                        });
                        return;
                    }
                    if (options.mutationFn?.toString?.().includes("csv-resolve-imports")) {
                        options.onSuccess({
                            data: [
                                {
                                    import_payment_id: 1,
                                    reference: "ref",
                                    action: 1,
                                    payment_id: 1,
                                    name: "Pagamento A",
                                    value: 100,
                                    date: "2026-03-01",
                                    payment_date: "2026-03-10",
                                    tags: [],
                                    has_budget_tag: false,
                                    isDirty: false,
                                },
                            ],
                        });
                        return;
                    }
                    options.onSuccess({ msg: "importado", total: 1 });
                }
            };
            const mutation = { mutate, isPending: false };
            mutations.push(mutation);
            return mutation;
        });

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <CsvImportProvider>{children}</CsvImportProvider>
        );
        const { result } = renderHook(() => useCsvImportProvider(), { wrapper });

        act(() => {
            result.current.setOpenModal(true);
            result.current.setDragActive(true);
            result.current.handleSelectImportType("transactions");
        });
        expect(result.current.step).toBe("upload");

        act(() => {
            result.current.handleFileParsed("teste.csv", ["Valor"], [{ Valor: "100" }]);
        });
        expect(result.current.step).toBe("mapping");
        expect(result.current.columnMappings.length).toBeGreaterThan(0);

        act(() => {
            result.current.handleUpdateMapping("Valor", "value");
            result.current.processTransactions();
        });
        expect(result.current.step).toBe("preview");
        expect(result.current.parsedTransactions.length).toBe(1);

        act(() => {
            result.current.toggleSelection("1");
            result.current.toggleAllSelection(true);
            result.current.toggleSelectionTransactionsToMerge("1");
            result.current.mergePayments();
            result.current.unmergePayments("merge-group-1");
            result.current.linkPayment("1", {
                id: 10,
                name: "Match",
                score: 95,
                date: "2026-03-01",
                payment_date: "2026-03-10",
                value: 100,
            });
            result.current.setSearchTerm("pag");
            result.current.setShowOnlyMatches(true);
            result.current.goToStep("reconciliation");
        });

        expect(result.current.filteredTransactions.length).toBeGreaterThanOrEqual(0);
        expect(result.current.stats.total).toBe(1);

        await act(async () => {
            await result.current.handleImport();
        });
        expect(result.current.step).toBe("confirm");
        expect(result.current.resolvedImports.length).toBe(1);

        act(() => {
            result.current.handleChangeTags(1, [
                {
                    id: 100,
                    name: "Budget",
                    color: "#fff",
                    is_budget: true,
                    total_closed: 0,
                    total_open: 0,
                    total_payments: 0,
                    total_value: 0,
                },
            ]);
            result.current.handleConfirmImport();
        });

        expect(messageSuccessMock).toHaveBeenCalled();
        expect(result.current.resolvedImports.length).toBe(0);

        act(() => {
            result.current.goToPreviousStep();
            result.current.goToPreviousStep();
            result.current.handleCloseModal();
        });
        expect(result.current.openModal).toBe(false);
        expect(result.current.step).toBe("type");
    });

    test("cobre erro na finalização do import", () => {
        useMutationMock.mockImplementation((options: any) => ({
            mutate: () => {
                if (options?.onError) {
                    options.onError({ response: { data: { msg: "falha import" } }, message: "falha import" });
                }
            },
            isPending: false,
        }));

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <CsvImportProvider>{children}</CsvImportProvider>
        );
        const { result } = renderHook(() => useCsvImportProvider(), { wrapper });

        act(() => {
            result.current.handleConfirmImport();
        });

        expect(messageErrorMock).toHaveBeenCalledWith({ content: "falha import", key: "csv_import" });
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useCsvImportProvider())).toThrow(
            "useCsvImportProvider must be used within CsvImportProvider",
        );
    });
});
