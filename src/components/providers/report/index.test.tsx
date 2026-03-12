import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import dayjs from "dayjs";

const useQueryMock = jest.fn();
const useRouterMock = jest.fn();
const usePathnameMock = jest.fn();
const useSearchParamsMock = jest.fn();
const updateSearchParamsMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

jest.mock("next/navigation", () => ({
    useRouter: () => useRouterMock(),
    usePathname: () => usePathnameMock(),
    useSearchParams: () => useSearchParamsMock(),
}));

jest.mock("@/util", () => {
    const actual = jest.requireActual("@/util");
    return {
        ...actual,
        updateSearchParams: (...args: unknown[]) => updateSearchParamsMock(...args),
    };
});

import { ReportProvider, useReport } from "./index";

const ReportConsumer = () => {
    const value = useReport();
    return (
        <div>
            <div data-testid="period-label">{value.periodLabel}</div>
            <div data-testid="is-loading">{String(value.isLoadingPage)}</div>
            <div data-testid="has-data">{String(value.hasAnyData)}</div>
            <div data-testid="trend-size">{String(value.trendData.length)}</div>
            <div data-testid="table-size">{String(value.tableData.length)}</div>
            <div data-testid="tag-size">{String(value.invoiceByTagData.length)}</div>
            <div data-testid="insights-size">{String(value.insights.length)}</div>
            <div data-testid="priority-size">{String(value.priorityInsights.length)}</div>
            <div data-testid="cards-size">{String(value.executiveCards.length)}</div>
            <div data-testid="coverage-size">{String(value.coverageData.length)}</div>
            <div data-testid="kpi-profit">{String(value.kpis.profit)}</div>
            <button onClick={() => value.applyDateRange([dayjs("2026-03-01"), dayjs("2026-03-31")])}>apply</button>
            <button onClick={() => value.applyDateRange(undefined)}>apply-empty</button>
            <button onClick={value.clearFilters}>clear</button>
        </div>
    );
};

describe("ReportProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useRouterMock.mockReturnValue({ push: jest.fn(), replace: jest.fn() });
        usePathnameMock.mockReturnValue("/internal/financial/report");
        useSearchParamsMock.mockReturnValue(new URLSearchParams("date_from=2026-03-01&date_to=2026-03-31"));
    });

    test("agrega dados do relatório e expõe ações de filtros", () => {
        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            const key = options?.queryKey?.[1];
            if (key === "payments") {
                return {
                    data: {
                        payments: [{ label: "03/2026", credit: 1000, debit: 500, difference: 500, accumulated: 500 }],
                        fixed_credit: 100,
                        fixed_debit: 50,
                    },
                    isLoading: false,
                    isFetching: false,
                };
            }
            if (key === "month") {
                return {
                    data: { data: [{ id: 1, date: "2026-03-01", name: "03/2026", credit: 1000, debit: 500, difference: 500, accumulated: 500 }] },
                    isLoading: false,
                    isFetching: false,
                };
            }
            if (key === "count-payment") return { data: 10, isLoading: false, isFetching: false };
            if (key === "amount-payment") return { data: 2000, isLoading: false, isFetching: false };
            if (key === "amount-payment-open") return { data: 400, isLoading: false, isFetching: false };
            if (key === "amount-payment-closed") return { data: 1600, isLoading: false, isFetching: false };
            if (key === "invoice-by-tag")
                return { data: [{ name: "Casa", amount: 500, color: "#fff" }], isLoading: false, isFetching: false };
            if (key === "forecast") return { data: 1800, isLoading: false, isFetching: false };
            if (key === "metrics")
                return {
                    data: {
                        revenues: { value: 3000 },
                        expenses: { value: 1000 },
                        profit: { value: 2000 },
                        growth: { value: 10 },
                    },
                    isLoading: false,
                    isFetching: false,
                };
            return { data: undefined, isLoading: false, isFetching: false };
        });

        render(
            <ReportProvider>
                <ReportConsumer />
            </ReportProvider>,
        );

        expect(screen.getByTestId("period-label")).toHaveTextContent("01/03/2026 ate 31/03/2026");
        expect(screen.getByTestId("is-loading")).toHaveTextContent("false");
        expect(screen.getByTestId("has-data")).toHaveTextContent("true");
        expect(screen.getByTestId("trend-size")).toHaveTextContent("1");
        expect(screen.getByTestId("table-size")).toHaveTextContent("1");
        expect(screen.getByTestId("tag-size")).toHaveTextContent("1");
        expect(screen.getByTestId("insights-size")).toHaveTextContent("3");
        expect(screen.getByTestId("priority-size")).toHaveTextContent("3");
        expect(screen.getByTestId("cards-size")).toHaveTextContent("3");
        expect(screen.getByTestId("coverage-size")).toHaveTextContent("5");
        expect(screen.getByTestId("kpi-profit")).toHaveTextContent("2000");

        fireEvent.click(screen.getByText("apply"));
        fireEvent.click(screen.getByText("apply-empty"));
        fireEvent.click(screen.getByText("clear"));

        expect(updateSearchParamsMock).toHaveBeenCalled();
    });

    test("expõe fallback sem dados e com erro de endpoint, aplicando filtro default (M-2 a M+1)", () => {
        useSearchParamsMock.mockReturnValue(new URLSearchParams());
        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            if (options?.queryKey?.[1] === "payments") {
                return {
                    data: undefined,
                    isLoading: true,
                    isFetching: true,
                    error: { response: { data: { msg: "erro report" } } },
                };
            }
            return { data: undefined, isLoading: false, isFetching: false, error: undefined };
        });

        render(
            <ReportProvider>
                <ReportConsumer />
            </ReportProvider>,
        );

        const expectedFrom = dayjs().subtract(2, "month").startOf("month").format("DD/MM/YYYY");
        const expectedTo = dayjs().add(1, "month").endOf("month").format("DD/MM/YYYY");
        expect(screen.getByTestId("period-label")).toHaveTextContent(`${expectedFrom} ate ${expectedTo}`);
        expect(screen.getByTestId("has-data")).toHaveTextContent("false");
        expect(screen.getByTestId("trend-size")).toHaveTextContent("0");
        expect(screen.getByTestId("table-size")).toHaveTextContent("0");
        expect(screen.getByTestId("tag-size")).toHaveTextContent("0");
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useReport())).toThrow("useReport must be used within a ReportProvider");
    });
});
