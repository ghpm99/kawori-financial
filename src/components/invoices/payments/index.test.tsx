import React from "react";
import { render, screen } from "@testing-library/react";

const usePaymentsMock = jest.fn();
const useSelectPaymentsMock = jest.fn();
const usePayoffMock = jest.fn();

jest.mock("@/components/providers/payments", () => ({
    usePayments: () => usePaymentsMock(),
    PaymentsProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="payments-provider">{children}</div>
    ),
}));

jest.mock("@/components/providers/selectPayments", () => ({
    useSelectPayments: () => useSelectPaymentsMock(),
}));

jest.mock("@/components/providers/payoff", () => ({
    usePayoff: () => usePayoffMock(),
}));

jest.mock("@/components/payments/paymentsTable", () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => <div data-testid="payments-table">{JSON.stringify(props)}</div>,
}));

jest.mock("@/components/payments/paymentsDrawer", () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => <div data-testid="payments-drawer">{JSON.stringify(props)}</div>,
}));

import { InvoicePayments } from "./index";

describe("InvoicePayments", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        usePaymentsMock.mockReturnValue({
            paymentsData: { data: [] },
            isLoading: false,
            paymentFilters: { page: 1, page_size: 10 },
            onChangePagination: jest.fn(),
            handleChangeFilter: jest.fn(),
            handleDateRangedFilter: jest.fn(),
            handleSelectFilter: jest.fn(),
            onOpenPaymentDetail: jest.fn(),
            onClosePaymentDetail: jest.fn(),
            paymentDetailVisible: false,
            paymentDetail: null,
            isLoadingPaymentDetail: false,
            onUpdatePaymentDetail: jest.fn(),
        });
        useSelectPaymentsMock.mockReturnValue({
            selectedRow: [],
            updateSelectedRows: jest.fn(),
        });
        usePayoffMock.mockReturnValue({
            payOffPayment: jest.fn(),
        });
    });

    test("renderiza tabela e drawer usando providers/hook data", () => {
        const handleSelectFilter = jest.fn();
        usePaymentsMock.mockReturnValue({
            paymentsData: { data: [] },
            isLoading: false,
            paymentFilters: { page: 1, page_size: 10 },
            onChangePagination: jest.fn(),
            handleChangeFilter: jest.fn(),
            handleDateRangedFilter: jest.fn(),
            handleSelectFilter,
            onOpenPaymentDetail: jest.fn(),
            onClosePaymentDetail: jest.fn(),
            paymentDetailVisible: false,
            paymentDetail: null,
            isLoadingPaymentDetail: false,
            onUpdatePaymentDetail: jest.fn(),
        });

        render(
            <InvoicePayments
                invoiceData={{
                    id: 10,
                    status: 1,
                    name: "Inv",
                    installments: 1,
                    value: 100,
                    value_open: 20,
                    value_closed: 80,
                    date: "2026-03-01",
                    next_payment: "2026-03-10",
                    tags: [],
                }}
                page={1}
                page_size={10}
            />,
        );

        expect(screen.getByTestId("payments-provider")).toBeInTheDocument();
        expect(screen.getByTestId("payments-table")).toBeInTheDocument();
        expect(screen.getByTestId("payments-drawer")).toBeInTheDocument();
        expect(handleSelectFilter).toHaveBeenCalledWith("invoice_id", 10);
    });
});
