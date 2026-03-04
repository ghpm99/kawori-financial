import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";

import { BudgetProvider, useBudget } from "./index";

const useQueryMock = jest.fn();
const useMutationMock = jest.fn();
const messageSuccessMock = jest.fn();
const messageErrorMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

jest.mock("antd", () => ({
    message: {
        success: (...args: unknown[]) => messageSuccessMock(...args),
        error: (...args: unknown[]) => messageErrorMock(...args),
    },
}));

const BudgetConsumer = () => {
    const value = useBudget();

    return (
        <div>
            <div data-testid="budgets-size">{String(value.budgets.length)}</div>
            <div data-testid="selected-budget">{String(value.selectedBudget?.id ?? "")}</div>
            <div data-testid="total-amount">{String(value.totalAmount)}</div>
            <div data-testid="enabled-save">{String(value.enabledSave)}</div>
            <div data-testid="feedback-type">{String(value.feedbackMessage.type)}</div>
            <button
                onClick={() =>
                    value.setBudgets([
                        {
                            id: 1,
                            name: "Casa",
                            allocation_percentage: 50,
                            estimated_expense: 0,
                            actual_expense: 0,
                            difference: 0,
                            color: "#111",
                        },
                        {
                            id: 2,
                            name: "Mercado",
                            allocation_percentage: 30,
                            estimated_expense: 0,
                            actual_expense: 0,
                            difference: 0,
                            color: "#222",
                        },
                    ])
                }
            >
                set-80
            </button>
            <button
                onClick={() =>
                    value.setBudgets([
                        {
                            id: 1,
                            name: "Casa",
                            allocation_percentage: 70,
                            estimated_expense: 0,
                            actual_expense: 0,
                            difference: 0,
                            color: "#111",
                        },
                        {
                            id: 2,
                            name: "Mercado",
                            allocation_percentage: 50,
                            estimated_expense: 0,
                            actual_expense: 0,
                            difference: 0,
                            color: "#222",
                        },
                    ])
                }
            >
                set-120
            </button>
            <button
                onClick={() =>
                    value.setBudgets([
                        {
                            id: 1,
                            name: "Casa",
                            allocation_percentage: 60,
                            estimated_expense: 0,
                            actual_expense: 0,
                            difference: 0,
                            color: "#111",
                        },
                        {
                            id: 2,
                            name: "Mercado",
                            allocation_percentage: 40,
                            estimated_expense: 0,
                            actual_expense: 0,
                            difference: 0,
                            color: "#222",
                        },
                    ])
                }
            >
                set-100
            </button>
            <button
                onClick={() =>
                    value.addBudget({
                        id: 3,
                        name: "Lazer",
                        allocation_percentage: 0,
                        estimated_expense: 0,
                        actual_expense: 0,
                        difference: 0,
                        color: "#333",
                    })
                }
            >
                add
            </button>
            <button onClick={() => value.updateBudget(3, { name: "Lazer atualizado" })}>update</button>
            <button onClick={() => value.selectBudget(1)}>select-1</button>
            <button onClick={() => value.removeBudget(1)}>remove-1</button>
            <button onClick={() => value.clearSelection()}>clear-selection</button>
            <button onClick={() => value.updateBudgetAllocationPercentage(2, null)}>alloc-null</button>
            <button onClick={() => value.updateBudgetAllocationPercentage(2, 45)}>alloc-45</button>
            <button onClick={() => value.changePeriodFilter(null, null)}>period-null</button>
            <button onClick={() => value.changePeriodFilter(dayjs("2026-03-01"), "03/2026")}>period-date</button>
            <button onClick={value.saveBudgets}>save</button>
            <button onClick={value.resetBudgets}>reset</button>
            <button onClick={value.cleanFilter}>noop</button>
        </div>
    );
};

describe("BudgetProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("manipula orçamento local, feedback e gatilhos de salvar/resetar", () => {
        const mutateSaveMock = jest.fn();
        const mutateResetMock = jest.fn();
        let mutationCallIndex = 0;

        useQueryMock.mockReturnValue({
            data: [],
            isLoading: false,
        });

        useMutationMock.mockImplementation((options: { onSuccess?: (msg: string) => void }) => {
            const currentIndex = mutationCallIndex % 2;
            mutationCallIndex += 1;

            return {
                mutate: (payload?: unknown) => {
                    if (currentIndex === 0) {
                        mutateSaveMock(payload);
                        options.onSuccess?.("salvo");
                        return;
                    }

                    mutateResetMock();
                    options.onSuccess?.("resetado");
                },
            };
        });

        render(
            <BudgetProvider>
                <BudgetConsumer />
            </BudgetProvider>,
        );

        fireEvent.click(screen.getByText("set-80"));
        expect(screen.getByTestId("total-amount")).toHaveTextContent("80");
        expect(screen.getByTestId("enabled-save")).toHaveTextContent("false");
        expect(screen.getByTestId("feedback-type")).toHaveTextContent("warning");

        fireEvent.click(screen.getByText("set-120"));
        expect(screen.getByTestId("total-amount")).toHaveTextContent("120");
        expect(screen.getByTestId("feedback-type")).toHaveTextContent("error");

        fireEvent.click(screen.getByText("set-100"));
        expect(screen.getByTestId("enabled-save")).toHaveTextContent("true");
        expect(screen.getByTestId("feedback-type")).toHaveTextContent("info");

        fireEvent.click(screen.getByText("add"));
        fireEvent.click(screen.getByText("update"));
        fireEvent.click(screen.getByText("select-1"));
        expect(screen.getByTestId("selected-budget")).toHaveTextContent("1");

        fireEvent.click(screen.getByText("remove-1"));
        expect(screen.getByTestId("selected-budget")).toHaveTextContent("");

        fireEvent.click(screen.getByText("alloc-null"));
        fireEvent.click(screen.getByText("alloc-45"));

        fireEvent.click(screen.getByText("period-null"));
        fireEvent.click(screen.getByText("period-date"));
        fireEvent.click(screen.getByText("set-100"));

        fireEvent.click(screen.getByText("save"));
        fireEvent.click(screen.getByText("reset"));
        fireEvent.click(screen.getByText("clear-selection"));

        expect(mutateSaveMock).toHaveBeenCalled();
        expect(mutateResetMock).toHaveBeenCalled();
        expect(messageSuccessMock).toHaveBeenCalledTimes(2);
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useBudget())).toThrow("useBudget must be used within BudgetProvider");
    });
});
