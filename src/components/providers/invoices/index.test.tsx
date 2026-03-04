import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

const useQueryMock = jest.fn();
const useMutationMock = jest.fn();
const useQueryClientMock = jest.fn();
const messageSuccessMock = jest.fn();
const messageErrorMock = jest.fn();
const messageLoadingMock = jest.fn();
const updateSearchParamsMock = jest.fn();
const useRouterMock = jest.fn();
const usePathnameMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
    useQueryClient: () => useQueryClientMock(),
}));

jest.mock("antd", () => ({
    message: {
        success: (...args: unknown[]) => messageSuccessMock(...args),
        error: (...args: unknown[]) => messageErrorMock(...args),
        loading: (...args: unknown[]) => messageLoadingMock(...args),
    },
}));

jest.mock("next/navigation", () => ({
    useRouter: () => useRouterMock(),
    usePathname: () => usePathnameMock(),
}));

jest.mock("@/util", () => {
    const actual = jest.requireActual("@/util");
    return {
        ...actual,
        updateSearchParams: (...args: unknown[]) => updateSearchParamsMock(...args),
    };
});

const { InvoicesProvider, useInvoices } = require("./index");

const InvoicesConsumer = () => {
    const value = useInvoices();
    return (
        <div>
            <div data-testid="filters">{JSON.stringify(value.invoiceFilters)}</div>
            <div data-testid="rows">{String(value.invoicesData.data.length)}</div>
            <div data-testid="detail-visible">{String(value.invoiceDetailVisible)}</div>
            <button onClick={value.cleanFilter}>clean</button>
            <button onClick={() => value.handleChangeFilter({ target: { name: "name__icontains", value: "abc" } })}>
                change
            </button>
            <button onClick={() => value.onChangePagination(2, 50)}>pagination</button>
            <button
                onClick={() =>
                    value.handleChangeAllFilters({
                        page: 1,
                        page_size: 10,
                        status: "open",
                    })
                }
            >
                all
            </button>
            <button
                onClick={() =>
                    value.updateFiltersBySearchParams({
                        page: "3",
                        page_size: "20",
                        status: "done",
                        name__icontains: "k",
                    })
                }
            >
                search
            </button>
            <button onClick={() => value.updateFiltersBySearchParams({})}>search-empty</button>
            <button onClick={() => value.onOpenInvoiceDetail(10)}>open</button>
            <button onClick={value.onCloseInvoiceDetail}>close</button>
            <button
                onClick={() =>
                    value.onUpdateInvoiceDetail({
                        id: 10,
                        status: 1,
                        name: "Nota 10",
                        installments: 1,
                        value: 100,
                        value_open: 20,
                        value_closed: 80,
                        date: "2026-03-01",
                        next_payment: "2026-03-10",
                        tags: [{ id: 1, name: "Casa", color: "#fff", is_budget: false, total_closed: 0, total_open: 0, total_payments: 0, total_value: 0 }],
                        active: true,
                        fixed: false,
                    })
                }
            >
                update
            </button>
            <button
                onClick={() =>
                    value.onCreateNewInvoice({
                        id: 0,
                        status: 1,
                        name: "Nova nota",
                        installments: 1,
                        value: 200,
                        value_open: 200,
                        value_closed: 0,
                        date: "2026-03-01",
                        next_payment: "2026-03-10",
                        tags: [{ id: 2, name: "Mercado", color: "#000", is_budget: false, total_closed: 0, total_open: 0, total_payments: 0, total_value: 0 }],
                        active: true,
                        fixed: false,
                    })
                }
            >
                create
            </button>
        </div>
    );
};

describe("InvoicesProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRouterMock.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
        usePathnameMock.mockReturnValue("/internal/financial/invoices");
    });

    test("manipula filtros, detalhe e mutations com sucesso", () => {
        const refetchInvoicesMock = jest.fn();
        const invalidateQueriesMock = jest.fn();
        let mutationCallIndex = 0;

        useQueryClientMock.mockReturnValue({ invalidateQueries: invalidateQueriesMock });
        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            const key = options?.queryKey?.[0];
            if (key === "invoices") {
                return {
                    data: {
                        current_page: 1,
                        total_pages: 1,
                        page_size: 10,
                        has_previous: false,
                        has_next: false,
                        data: [{ id: 1 }],
                    },
                    isLoading: false,
                    refetch: refetchInvoicesMock,
                };
            }
            if (key === "invoiceDetail") {
                return { data: { id: 10, name: "detail" }, isLoading: false };
            }
            return { data: { data: [] }, isLoading: false };
        });

        useMutationMock.mockImplementation((options: { onSuccess?: (msg: string) => void }) => {
            const currentIndex = mutationCallIndex % 2;
            mutationCallIndex += 1;
            return {
                mutate: () => options.onSuccess?.(currentIndex === 0 ? "atualizada" : "criada"),
            };
        });

        render(
            <InvoicesProvider enableUpdateSearchParams={true}>
                <InvoicesConsumer />
            </InvoicesProvider>,
        );

        fireEvent.click(screen.getByText("search-empty"));
        fireEvent.click(screen.getByText("change"));
        fireEvent.click(screen.getByText("pagination"));
        fireEvent.click(screen.getByText("all"));
        fireEvent.click(screen.getByText("search"));
        fireEvent.click(screen.getByText("open"));
        expect(screen.getByTestId("detail-visible")).toHaveTextContent("true");

        fireEvent.click(screen.getByText("update"));
        fireEvent.click(screen.getByText("create"));
        fireEvent.click(screen.getByText("close"));
        fireEvent.click(screen.getByText("clean"));

        expect(messageLoadingMock).toHaveBeenCalled();
        expect(messageSuccessMock).toHaveBeenCalled();
        expect(refetchInvoicesMock).toHaveBeenCalled();
        expect(invalidateQueriesMock).toHaveBeenCalledWith({ queryKey: ["invoiceDetail"] });
        expect(updateSearchParamsMock).toHaveBeenCalled();
    });

    test("mostra mensagens de erro em update/create", () => {
        let mutationCallIndex = 0;
        useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
        useQueryMock.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            refetch: jest.fn(),
        });
        useMutationMock.mockImplementation((options: { onError?: (error: { response?: { data?: { msg?: string } } }) => void }) => {
            const currentIndex = mutationCallIndex % 2;
            mutationCallIndex += 1;
            return {
                mutate: () => options.onError?.({ response: { data: { msg: currentIndex === 0 ? "erro update" : "erro create" } } }),
            };
        });

        render(
            <InvoicesProvider enableUpdateSearchParams={false}>
                <InvoicesConsumer />
            </InvoicesProvider>,
        );

        fireEvent.click(screen.getByText("update"));
        fireEvent.click(screen.getByText("create"));

        expect(messageErrorMock).toHaveBeenCalledWith({ content: "erro update", key: "invoice_pagination_message" });
        expect(messageErrorMock).toHaveBeenCalledWith({ content: "erro create", key: "invoice_pagination_message" });
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useInvoices())).toThrow("useInvoices must be used within InvoicesProvider");
    });
});
