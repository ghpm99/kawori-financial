import React from "react";
import { render, screen } from "@testing-library/react";

import { DashboardProvider, useDashboard } from "./index";

const useQueryMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

const DashboardConsumer = () => {
    const value = useDashboard();

    return (
        <div>
            <div data-testid="revenues-status">{value.revenues.status}</div>
            <div data-testid="expenses-status">{value.expenses.status}</div>
            <div data-testid="profit-status">{value.profit.status}</div>
            <div data-testid="growth-status">{value.growth.status}</div>
            <div data-testid="payments-chart-size">{String(value.paymentsChart.length)}</div>
            <div data-testid="invoice-by-tag-size">{String(value.invoiceByTag.length)}</div>
            <div data-testid="budgets-size">{String(value.budgetsData.data.length)}</div>
            <div data-testid="budgets-loading">{String(value.budgetsData.isLoading)}</div>
        </div>
    );
};

describe("DashboardProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("monta contexto com mapeamentos de dados e status de métricas", () => {
        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            const key = options?.queryKey?.[0];

            if (key === "metrics_get_total") {
                return {
                    data: {
                        revenues: { value: 1000, metric_value: 0.5 },
                        expenses: { value: 500, metric_value: 2 },
                        profit: { value: 500, metric_value: 1 },
                        growth: { value: 10 },
                    },
                    isLoading: false,
                };
            }

            if (key === "paymentReport") {
                return {
                    data: {
                        payments: [{ label: "01/2026", credit: 100, debit: 30 }],
                    },
                };
            }

            if (key === "invoiceByTag") {
                return {
                    data: [{ name: "Mercado", amount: 80, color: "#fff" }],
                };
            }

            return {
                data: [{ id: 1, name: "Casa", allocation_percentage: 10 }],
                isLoading: true,
            };
        });

        render(
            <DashboardProvider>
                <DashboardConsumer />
            </DashboardProvider>,
        );

        expect(screen.getByTestId("revenues-status")).toHaveTextContent("negative");
        expect(screen.getByTestId("expenses-status")).toHaveTextContent("negative");
        expect(screen.getByTestId("profit-status")).toHaveTextContent("neutral");
        expect(screen.getByTestId("growth-status")).toHaveTextContent("positive");
        expect(screen.getByTestId("payments-chart-size")).toHaveTextContent("1");
        expect(screen.getByTestId("invoice-by-tag-size")).toHaveTextContent("1");
        expect(screen.getByTestId("budgets-size")).toHaveTextContent("1");
        expect(screen.getByTestId("budgets-loading")).toHaveTextContent("true");
    });

    test("cobre caminhos alternativos de status e fallbacks vazios", () => {
        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            const key = options?.queryKey?.[0];

            if (key === "metrics_get_total") {
                return {
                    data: {
                        revenues: { value: 1000, metric_value: 2 },
                        expenses: { value: 500, metric_value: 0.5 },
                        profit: { value: 500, metric_value: 2 },
                        growth: { value: 10 },
                    },
                    isLoading: false,
                };
            }

            return {
                data: undefined,
                isLoading: false,
            };
        });

        render(
            <DashboardProvider>
                <DashboardConsumer />
            </DashboardProvider>,
        );

        expect(screen.getByTestId("revenues-status")).toHaveTextContent("positive");
        expect(screen.getByTestId("expenses-status")).toHaveTextContent("positive");
        expect(screen.getByTestId("profit-status")).toHaveTextContent("positive");
        expect(screen.getByTestId("payments-chart-size")).toHaveTextContent("0");
        expect(screen.getByTestId("invoice-by-tag-size")).toHaveTextContent("0");
        expect(screen.getByTestId("budgets-size")).toHaveTextContent("0");
    });
});
