import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

const useQueryMock = jest.fn();
const useMutationMock = jest.fn();
const messageSuccessMock = jest.fn();
const messageErrorMock = jest.fn();
const messageLoadingMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

jest.mock("antd", () => ({
    message: {
        success: (...args: unknown[]) => messageSuccessMock(...args),
        error: (...args: unknown[]) => messageErrorMock(...args),
        loading: (...args: unknown[]) => messageLoadingMock(...args),
    },
}));

const { PaymentsTableProvider, usePaymentsTable } = require("./index");

const invoice = {
    id: 9,
    status: 1,
    name: "Inv 9",
    installments: 1,
    value: 100,
    value_open: 80,
    value_closed: 20,
    date: "2026-03-01",
    next_payment: "2026-03-10",
    tags: [],
};

const TableConsumer = () => {
    const value = usePaymentsTable();
    return (
        <div>
            <div data-testid="filters">{JSON.stringify(value.paymentFilters)}</div>
            <div data-testid="rows">{String(value.paymentsData.data.length)}</div>
            <div data-testid="selected">{String(value.selectedRow.length)}</div>
            <div data-testid="detail-visible">{String(value.paymentDetailVisible)}</div>
            <button onClick={value.cleanFilter}>clean</button>
            <button onClick={() => value.setSelectedRow([1, 2])}>select-rows</button>
            <button onClick={() => value.handleChangeFilter({ target: { name: "name__icontains", value: "abc" } })}>
                change
            </button>
            <button onClick={() => value.handleDateRangedFilter("date", ["01/03/2026", "10/03/2026"])}>date</button>
            <button onClick={() => value.handleSelectFilter("status", "done")}>select</button>
            <button onClick={() => value.onChangePagination(2, 50)}>pagination</button>
            <button
                onClick={() =>
                    value.updateFiltersBySearchParams({
                        page: 3,
                        page_size: 20,
                        active: true,
                        status: "open",
                        type: 2,
                    })
                }
            >
                search
            </button>
            <button onClick={() => value.updateFiltersBySearchParams({})}>search-empty</button>
            <button onClick={() => value.onOpenPaymentDetail(10)}>open</button>
            <button onClick={value.onClosePaymentDetail}>close</button>
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
                    value.onUpdatePaymentDetail({
                        id: 10,
                        status: 1,
                        type: 1,
                        name: "Pagamento",
                        description: "",
                        reference: "",
                        date: "",
                        installments: 1,
                        payment_date: "",
                        fixed: false,
                        active: true,
                        value: 100,
                        invoice: 1,
                        invoice_name: "Inv",
                    })
                }
            >
                update
            </button>
        </div>
    );
};

describe("PaymentsTableProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("manipula filtros, seleção e update com sucesso", () => {
        const refetchPaymentDetailMock = jest.fn();

        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            if (options?.queryKey?.[0] === "paymentsTable") {
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
                };
            }

            return {
                data: { id: 10, name: "detail" },
                isLoading: false,
                refetch: refetchPaymentDetailMock,
            };
        });

        useMutationMock.mockImplementation((options: { onSuccess?: (data: { msg: string }) => void }) => ({
            mutate: () => options.onSuccess?.({ msg: "ok" }),
        }));

        render(
            <PaymentsTableProvider invoice={invoice}>
                <TableConsumer />
            </PaymentsTableProvider>,
        );

        expect(screen.getByTestId("rows")).toHaveTextContent("1");

        fireEvent.click(screen.getByText("select-rows"));
        expect(screen.getByTestId("selected")).toHaveTextContent("2");

        fireEvent.click(screen.getByText("change"));
        fireEvent.click(screen.getByText("date"));
        fireEvent.click(screen.getByText("select"));
        fireEvent.click(screen.getByText("pagination"));
        fireEvent.click(screen.getByText("search"));
        fireEvent.click(screen.getByText("search-empty"));
        fireEvent.click(screen.getByText("all"));
        fireEvent.click(screen.getByText("open"));
        expect(screen.getByTestId("detail-visible")).toHaveTextContent("true");

        fireEvent.click(screen.getByText("update"));
        fireEvent.click(screen.getByText("close"));
        fireEvent.click(screen.getByText("clean"));

        expect(messageLoadingMock).toHaveBeenCalled();
        expect(messageSuccessMock).toHaveBeenCalled();
        expect(refetchPaymentDetailMock).toHaveBeenCalled();
    });

    test("mostra mensagem de erro no update", () => {
        useQueryMock.mockReturnValue({
            data: { data: [] },
            isLoading: false,
            refetch: jest.fn(),
        });
        useMutationMock.mockImplementation((options: { onError?: (error: { response?: { data?: { msg?: string } } }) => void }) => ({
            mutate: () => options.onError?.({ response: { data: { msg: "erro update" } } }),
        }));

        render(
            <PaymentsTableProvider invoice={invoice}>
                <TableConsumer />
            </PaymentsTableProvider>,
        );

        fireEvent.click(screen.getByText("update"));
        expect(messageErrorMock).toHaveBeenCalledWith({ content: "erro update", key: "payment_pagination_message" });
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => usePaymentsTable())).toThrow(
            "usePaymentsTable must be used within PaymentsTableProvider",
        );
    });
});
