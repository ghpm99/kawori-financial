import React from "react";
import { render, screen } from "@testing-library/react";

import BudgetProgress from "./BudgetProgress";
import GoalsProgress from "./GoalsProgress";
import InvoiceByTagChart from "./InvoiceByTagChart";
import InvoicesSection from "./InvoicesSection";
import DashboardMetrics from "./Metrics";
import PaymentsChart from "./PaymentsChart";
import Cards from "@/components/overview/cards";
import InvoiceByTag from "@/components/overview/invoiceByTag";
import PaymentFixed from "@/components/overview/paymentFixed";
import PaymentWithFixed from "@/components/overview/paymentWithFixed";
import PaymentWithoutFixed from "@/components/overview/paymentWithoutFixed";

jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Legend: () => <div />,
    Line: () => <div />,
    Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Cell: () => <div />,
}));

jest.mock("react-chartjs-2", () => ({
    Bar: ({ data }: { data: { labels: string[] } }) => <div data-testid="chart-bar">{data.labels?.join(",")}</div>,
    Line: ({ data }: { data: { labels: string[] } }) => <div data-testid="chart-line">{data.labels?.join(",")}</div>,
}));

jest.mock("@/components/invoices/invoicesTable", () => ({
    __esModule: true,
    default: () => <div data-testid="invoices-table" />,
}));

jest.mock("@/components/providers/invoices", () => ({
    InvoicesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useInvoices: () => ({
        invoicesData: [],
        isLoading: false,
        onChangePagination: jest.fn(),
        invoiceFilters: {},
        handleChangeFilter: jest.fn(),
        onOpenInvoiceDetail: jest.fn(),
    }),
}));

jest.mock("@/components/providers/report", () => ({
    useReport: () => ({
        countPayment: { isLoading: false, data: 10 },
        amountPayment: { isLoading: false, data: 1000 },
        amountPaymentOpen: { isLoading: false, data: 250 },
        amountPaymentClosed: { isLoading: false, data: 750 },
    }),
}));

describe("dashboard and overview components", () => {
    test("renderiza DashboardMetrics", () => {
        render(
            <DashboardMetrics
                revenues={{ loading: false, value: 10, status: "positive", metricIcon: <span>+</span>, metric_value: 2 }}
                expenses={{ loading: false, value: 5, status: "negative", metricIcon: <span>-</span>, metric_value: 1 }}
                profit={{ loading: false, value: 5, status: "positive", metricIcon: <span>+</span>, metric_value: 1 }}
                growth={{ loading: false, value: 10, status: "positive", metricIcon: <span>+</span> }}
            />,
        );

        expect(screen.getByText("Receita Total")).toBeInTheDocument();
        expect(screen.getByText("Gastos Totais")).toBeInTheDocument();
    });

    test("renderiza PaymentsChart e InvoiceByTagChart", () => {
        render(
            <>
                <PaymentsChart paymentsChart={[{ month: "jan", revenue: 100, expenses: 50 }]} />
                <InvoiceByTagChart invoiceByTag={[{ category: "Casa", amount: 150, color: "#fff" }]} />
            </>,
        );

        expect(screen.getByText("Receita vs Gastos")).toBeInTheDocument();
        expect(screen.getByText("Gastos por Categoria")).toBeInTheDocument();
    });

    test("renderiza BudgetProgress e GoalsProgress", () => {
        render(
            <>
                <BudgetProgress
                    isLoading={false}
                    data={[{ id: 1, name: "Moradia", estimated_expense: 100, actual_expense: 80, color: "#000" }]}
                />
                <GoalsProgress />
            </>,
        );

        expect(screen.getByText("Resumo do Mês")).toBeInTheDocument();
        expect(screen.getByText("Metas de Economia")).toBeInTheDocument();
    });

    test("renderiza InvoicesSection", () => {
        render(<InvoicesSection title="Notas vencidas" filters={{ page: 1, page_size: 3 }} />);
        expect(screen.getByText("Notas vencidas")).toBeInTheDocument();
        expect(screen.getByTestId("invoices-table")).toBeInTheDocument();
    });

    test("renderiza componentes de overview", () => {
        render(
            <>
                <Cards />
                <InvoiceByTag data={[{ id: 1, name: "Casa", amount: 100, color: "#333" }]} theme="light" />
                <PaymentFixed fixedCredit={200} fixedDebit={150} theme="dark" />
                <PaymentWithFixed data={[{ label: "2024-01-01", credit: 10, debit: 5, difference: 5 }]} theme="light" />
                <PaymentWithoutFixed
                    amountForecastValue={300}
                    payments={[{ label: "2024-01-01", accumulated: 50, credit: 0, debit: 0, difference: 0 }]}
                    theme="dark"
                />
            </>,
        );

        expect(screen.getByText("Total de pagamentos")).toBeInTheDocument();
        expect(screen.getAllByTestId("chart-bar").length).toBeGreaterThan(0);
        expect(screen.getAllByTestId("chart-line").length).toBeGreaterThan(0);
    });
});
