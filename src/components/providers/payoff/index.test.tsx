import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

const useMutationMock = jest.fn();
const useQueryClientMock = jest.fn();
const useSelectPaymentsMock = jest.fn();
const messageLoadingMock = jest.fn();
const messageSuccessMock = jest.fn();
const messageErrorMock = jest.fn();
const axiosIsAxiosErrorMock = jest.fn();
const callbackDoneMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useMutation: (...args: unknown[]) => useMutationMock(...args),
    useQueryClient: () => useQueryClientMock(),
}));

jest.mock("antd", () => ({
    message: {
        loading: (...args: unknown[]) => messageLoadingMock(...args),
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

jest.mock("../selectPayments", () => ({
    useSelectPayments: () => useSelectPaymentsMock(),
}));

jest.mock("@/components/payments/modalPayoff", () => ({
    __esModule: true,
    default: ({ visible, progressText }: { visible: boolean; progressText: string }) => (
        <div data-testid="modal-payoff">
            {String(visible)}-{progressText}
        </div>
    ),
}));

import { PayoffProvider, usePayoff } from "./index";

const PayoffConsumer = () => {
    const value = usePayoff();

    return (
        <div>
            <div data-testid="batch-size">{String(value.paymentsToProcess.length)}</div>
            <div data-testid="batch-visible">{String(value.modalBatchVisible)}</div>
            <div data-testid="batch-progress">{String(value.paymentPayoffBatchProgress)}</div>
            <div data-testid="batch-failed">{String(value.paymentPayoffBatchPercentFailed)}</div>
            <div data-testid="batch-text">{value.paymentPayoffBatchProgressText()}</div>
            <div data-testid="batch-completed">{String(value.processPayOffBatchCompleted)}</div>
            <div data-testid="batch-processing">{String(value.processingBatch)}</div>
            <button onClick={value.openPayoffBatchModal}>open</button>
            <button onClick={value.closePayoffBatchModal}>close</button>
            <button onClick={() => value.setCallback(callbackDoneMock)}>set-callback</button>
            <button onClick={value.runCallback}>run-callback</button>
            <button onClick={value.clearCallback}>clear-callback</button>
            <button onClick={value.processPayOffBatch}>process-batch</button>
            <button onClick={() => value.payOffPayment(1)}>payoff-1</button>
            <button onClick={() => value.payOffPayment(2)}>payoff-2</button>
            <button onClick={value.clearPaymentsToProcess}>clear-payments</button>
            <button
                onClick={() =>
                    value.setPaymentsToProcess([
                        { id: 1, name: "A", description: "ok", status: "completed" },
                        { id: 2, name: "B", description: "ok", status: "completed" },
                    ])
                }
            >
                set-completed
            </button>
            <button
                onClick={() =>
                    value.setPaymentsToProcess([
                        { id: 1, name: "A", description: "erro", status: "failed" },
                        { id: 2, name: "B", description: "erro", status: "failed" },
                    ])
                }
            >
                set-failed
            </button>
            <button
                onClick={() =>
                    value.setPaymentsToProcess([
                        { id: 1, name: "A", description: "ok", status: "completed" },
                        { id: 2, name: "B", description: "erro", status: "failed" },
                    ])
                }
            >
                set-mixed
            </button>
            <button
                onClick={() =>
                    value.setPaymentsToProcess([{ id: 1, name: "A", description: "aguardando", status: "pending" }])
                }
            >
                set-pending
            </button>
        </div>
    );
};

describe("PayoffProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("cobre textos alternativos de progresso, abertura/fechamento e callback manual", () => {
        useSelectPaymentsMock.mockReturnValue({
            selectedRow: [
                { id: 1, name: "Conta 1", selected: true },
                { id: 2, name: "Conta 2", selected: false },
            ],
            clearSelection: jest.fn(),
        });
        useQueryClientMock.mockReturnValue({ invalidateQueries: jest.fn() });
        useMutationMock.mockReturnValue({ mutateAsync: jest.fn() });
        axiosIsAxiosErrorMock.mockReturnValue(false);

        render(
            <PayoffProvider>
                <PayoffConsumer />
            </PayoffProvider>,
        );

        expect(screen.getByTestId("batch-text")).toHaveTextContent("Sem itens para processar");

        fireEvent.click(screen.getByText("open"));
        expect(screen.getByTestId("batch-visible")).toHaveTextContent("true");
        expect(screen.getByTestId("batch-size")).toHaveTextContent("1");

        fireEvent.click(screen.getByText("set-completed"));
        expect(screen.getByTestId("batch-text")).toHaveTextContent("Todos concluídos com sucesso");

        fireEvent.click(screen.getByText("set-failed"));
        expect(screen.getByTestId("batch-text")).toHaveTextContent("Todos falharam no processamento");

        fireEvent.click(screen.getByText("set-pending"));
        expect(screen.getByTestId("batch-text")).toHaveTextContent("Aguardando processamento, total de 1 itens");

        fireEvent.click(screen.getByText("set-callback"));
        fireEvent.click(screen.getByText("run-callback"));
        expect(callbackDoneMock).toHaveBeenCalled();

        fireEvent.click(screen.getByText("clear-callback"));
        fireEvent.click(screen.getByText("run-callback"));
        expect(callbackDoneMock).toHaveBeenCalledTimes(1);

        fireEvent.click(screen.getByText("clear-payments"));
        fireEvent.click(screen.getByText("close"));
        expect(screen.getByTestId("batch-visible")).toHaveTextContent("false");
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => usePayoff())).toThrow("usePayoff must be used within PayoffProvider");
    });
});
