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

import { PaymentsProvider, usePayments } from "./index";

const PaymentsConsumer = () => {
    const value = usePayments();

    return (
        <div>
            <div data-testid="filters">{JSON.stringify(value.paymentFilters)}</div>
            <div data-testid="rows">{String(value.paymentsData.data.length)}</div>
            <div data-testid="detail-visible">{String(value.paymentDetailVisible)}</div>
            <button onClick={value.cleanFilter}>clean</button>
            <button onClick={() => value.handleChangeFilter({ target: { name: "name__icontains", value: "abc" } })}>
                change
            </button>
            <button onClick={() => value.handleDateRangedFilter("date", ["01/03/2026", "10/03/2026"])}>date</button>
            <button onClick={() => value.handleSelectFilter("status", "done")}>select</button>
            <button onClick={() => value.onChangePagination(2, 50)}>pagination</button>
            <button
                onClick={() =>
                    value.updateFiltersBySearchParams({
                        page: "3",
                        page_size: "20",
                        active: "true",
                        fixed: "false",
                        status: "open",
                        type: "2",
                        installments: "10",
                        name__icontains: "foo",
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

describe("PaymentsProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("manipula filtros, detalhe e update com sucesso", () => {
        const refetchPaymentsMock = jest.fn();
        const refetchPaymentDetailMock = jest.fn();

        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            const key = options?.queryKey?.[0];
            if (key === "payments") {
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
                    refetch: refetchPaymentsMock,
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
            <PaymentsProvider customDefaultFilters={{ status: "done" }}>
                <PaymentsConsumer />
            </PaymentsProvider>,
        );

        expect(screen.getByTestId("rows")).toHaveTextContent("1");
        expect(screen.getByTestId("filters")).toHaveTextContent('"status":"done"');

        fireEvent.click(screen.getByText("change"));
        fireEvent.click(screen.getByText("date"));
        fireEvent.click(screen.getByText("select"));
        fireEvent.click(screen.getByText("pagination"));
        fireEvent.click(screen.getByText("search-empty"));
        fireEvent.click(screen.getByText("search"));
        fireEvent.click(screen.getByText("open"));
        expect(screen.getByTestId("detail-visible")).toHaveTextContent("true");

        fireEvent.click(screen.getByText("update"));
        fireEvent.click(screen.getByText("close"));
        fireEvent.click(screen.getByText("clean"));

        expect(messageLoadingMock).toHaveBeenCalled();
        expect(messageSuccessMock).toHaveBeenCalled();
        expect(refetchPaymentsMock).toHaveBeenCalled();
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
            <PaymentsProvider>
                <PaymentsConsumer />
            </PaymentsProvider>,
        );

        fireEvent.click(screen.getByText("update"));
        expect(messageErrorMock).toHaveBeenCalledWith({ content: "erro update", key: "payment_pagination_message" });
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => usePayments())).toThrow("usePayments must be used within PaymentsProvider");
    });
});
