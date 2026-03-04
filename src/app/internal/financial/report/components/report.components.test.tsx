import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import {
    ReportCharts,
    ReportError,
    ReportFilters,
    ReportHeader,
    ReportInsights,
    ReportMonthlyHistory,
    ReportStats,
} from ".";

const applyDateRangeMock = jest.fn();
const clearFiltersMock = jest.fn();
const useReportMock = jest.fn();

jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    AreaChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Legend: () => <div />,
    Line: () => <div />,
    Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Area: () => <div />,
    Cell: () => <div />,
}));

jest.mock("@/components/providers/report", () => ({
    useReport: () => useReportMock(),
}));

describe("report components", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useReportMock.mockReturnValue({
            periodLabel: "01/2026 - 02/2026",
            activeFilters: { date_from: "2026-01-01", date_to: "2026-01-31" },
            applyDateRange: applyDateRangeMock,
            clearFilters: clearFiltersMock,
            isFetchingPage: false,
            isLoadingPage: false,
            errorMessage: "erro x",
            hasAnyData: true,
            kpis: {
                revenues: 100,
                expenses: 50,
                profit: 50,
                growth: 10,
                savingsRate: 30,
                averageTicket: 20,
                openShare: 40,
                closedShare: 60,
                forecast: 120,
                totalPayments: 100,
                forecastGap: -20,
            },
            executiveCards: [{ id: "1", title: "Saude", value: "Boa", caption: "ok", status: "good" }],
            trendData: [{ month: "Jan", credit: 10, debit: 5, difference: 5, accumulated: 5 }],
            invoiceByTagData: [{ name: "Casa", amount: 100 }],
            paymentStatusData: [{ name: "Aberto", value: 20 }],
            insights: ["insight 1"],
            priorityInsights: [
                {
                    id: "p1",
                    severity: "attention",
                    title: "Ajustar custo",
                    metric: "gasto",
                    context: "contexto",
                    action: "acao",
                },
            ],
            coverageData: [{ key: "1", label: "Cobertura", value: "80%" }],
            tableData: [
                {
                    id: 1,
                    month: "Jan",
                    total_value_credit: 100,
                    total_value_debit: 30,
                    total_value_open: 10,
                    total_value_closed: 20,
                    total_payments: 3,
                },
            ],
        });
    });

    test("renderiza header e stats", () => {
        render(
            <>
                <ReportHeader />
                <ReportStats />
            </>,
        );

        expect(screen.getByText("Relatorios Financeiros")).toBeInTheDocument();
        expect(screen.getByText(/Periodo:/i)).toBeInTheDocument();
        expect(screen.getByText("Receitas")).toBeInTheDocument();
    });

    test("renderiza filtros e limpa filtro", () => {
        render(<ReportFilters />);
        fireEvent.click(screen.getByRole("button", { name: /Limpar filtro/i }));
        expect(clearFiltersMock).toHaveBeenCalled();
    });

    test("renderiza erro quando existir mensagem", () => {
        render(<ReportError />);
        expect(screen.getByText("Falha ao carregar relatorios financeiros")).toBeInTheDocument();
    });

    test("renderiza charts, insights e tabela mensal", () => {
        render(
            <>
                <ReportCharts />
                <ReportInsights />
                <ReportMonthlyHistory />
            </>,
        );

        expect(screen.getByText("Entradas x Saidas por mes")).toBeInTheDocument();
        expect(screen.getByText("Plano de acao recomendado")).toBeInTheDocument();
        expect(screen.getByText("Historico mensal consolidado")).toBeInTheDocument();
    });
});
