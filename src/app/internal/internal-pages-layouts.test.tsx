import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import InternalLayout from "./layout";
import AdminLayout from "../admin/layout";
import DashboardFinancialLayout from "./financial/(dashboard)/layout";
import BillsLayout from "./financial/bills/layout";
import BudgetLayout from "./financial/budget/layout";
import EarningsLayout from "./financial/earnings/layout";
import InvoicesLayout from "./financial/invoices/layout";
import ReportLayout from "./financial/report/layout";
import ScheduledBillsLayout from "./financial/scheduled_bills/layout";
import TagsLayout from "./financial/tags/layout";
import DashboardPage from "./financial/(dashboard)/page";
import BillsPage from "./financial/bills/page";
import BudgetPage from "./financial/budget/page";
import EarningsPage from "./financial/earnings/page";
import InvoicesPage from "./financial/invoices/page";
import MonthlyPage from "./financial/monthly/page";
import ScheduledBillsPage from "./financial/scheduled_bills/page";
import TagsPage from "./financial/tags/page";
import ReportPage from "./financial/report/page";

const openPayoffBatchModal = jest.fn();
const cleanFilter = jest.fn();
const onOpenInvoiceDetail = jest.fn();
const onOpenPaymentDetail = jest.fn();
const setOpenCsvImportModal = jest.fn();
const updateSearchParamsMock = jest.fn();

jest.mock("@/components/loginHeader/Index", () => ({
    __esModule: true,
    default: () => <div>login-header</div>,
}));

jest.mock("@/components/menuInternal/Index", () => ({
    __esModule: true,
    default: () => <div>menu-internal</div>,
}));

jest.mock("@/components/dashboard/BudgetProgress", () => ({
    __esModule: true,
    default: () => <div>budget-progress</div>,
}));

jest.mock("@/components/dashboard/GoalsProgress", () => ({
    __esModule: true,
    default: () => <div>goals-progress</div>,
}));

jest.mock("@/components/dashboard/InvoiceByTagChart", () => ({
    __esModule: true,
    default: () => <div>invoice-by-tag-chart</div>,
}));

jest.mock("@/components/dashboard/InvoicesSection", () => ({
    __esModule: true,
    default: ({ title }: { title: string }) => <div>{title}</div>,
}));

jest.mock("@/components/dashboard/Metrics", () => ({
    __esModule: true,
    default: () => <div>dashboard-metrics</div>,
}));

jest.mock("@/components/dashboard/PaymentsChart", () => ({
    __esModule: true,
    default: () => <div>payments-chart</div>,
}));

jest.mock("@/components/invoices/invoicesTable", () => ({
    __esModule: true,
    default: () => <div>invoices-table</div>,
}));

jest.mock("@/components/invoices/invoiceDrawer", () => ({
    __esModule: true,
    default: () => <div>invoice-drawer</div>,
}));

jest.mock("@/components/payments/paymentsTable", () => ({
    __esModule: true,
    default: () => <div>payments-table</div>,
}));

jest.mock("@/components/payments/paymentsDrawer", () => ({
    __esModule: true,
    default: () => <div>payments-drawer</div>,
}));

jest.mock("@/components/tags/tagDrawer", () => ({
    __esModule: true,
    default: () => <div>tag-drawer</div>,
}));

jest.mock("@/components/csvImport/CsvImportModal", () => ({
    __esModule: true,
    default: () => <div>csv-import-modal</div>,
}));

jest.mock("@/components/budget/goals", () => ({
    __esModule: true,
    default: () => <div>budget-goals</div>,
}));

jest.mock("@/components/budget/report", () => ({
    __esModule: true,
    default: () => <div>budget-report</div>,
}));

jest.mock("@/components/providers/auth", () => ({
    useAuth: () => ({ isAuthenticated: true, signOut: jest.fn() }),
}));

jest.mock("@/components/providers/user", () => ({
    useUser: () => ({ user: { name: "User" } }),
}));

jest.mock("@/components/providers/layout", () => ({
    useLayout: () => ({
        selectedMenu: [],
        menuCollapsed: false,
        toggleCollapsed: jest.fn(),
        menuItems: [],
    }),
    LayoutProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/themeProvider/themeContext", () => ({
    useTheme: () => ({ state: { theme: "light" } }),
}));

jest.mock("@/components/providers/dashboard", () => ({
    useDashboard: () => ({
        revenues: {},
        expenses: {},
        profit: {},
        growth: {},
        paymentsChart: [],
        invoiceByTag: [],
        budgetsData: { data: [], isLoading: false },
    }),
    DashboardProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/payments", () => ({
    usePayments: () => ({
        paymentFilters: {},
        paymentsData: [],
        refetchPayments: jest.fn(),
        isLoading: false,
        onChangePagination: jest.fn(),
        handleChangeFilter: jest.fn(),
        handleDateRangedFilter: jest.fn(),
        handleSelectFilter: jest.fn(),
        updateFiltersBySearchParams: jest.fn(),
        cleanFilter,
        paymentDetailVisible: false,
        onClosePaymentDetail: jest.fn(),
        onOpenPaymentDetail,
        isLoadingPaymentDetail: false,
        paymentDetail: undefined,
        onUpdatePaymentDetail: jest.fn(),
    }),
    PaymentsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/invoices", () => ({
    useInvoices: () => ({
        invoicesData: [],
        refetchInvoices: jest.fn(),
        isLoading: false,
        onChangePagination: jest.fn(),
        invoiceFilters: {},
        handleChangeFilter: jest.fn(),
        cleanFilter,
        onOpenInvoiceDetail,
        invoiceDetailVisible: false,
        onCloseInvoiceDetail: jest.fn(),
        invoiceDetail: undefined,
        isLoadingInvoiceDetail: false,
        onUpdateInvoiceDetail: jest.fn(),
        onCreateNewInvoice: jest.fn(),
        updateFiltersBySearchParams: jest.fn(),
    }),
    InvoicesProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/selectPayments", () => ({
    useSelectPayments: () => ({ selectedRow: [{ selected: true }], updateSelectedRows: jest.fn() }),
    SelectPaymentsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/payoff", () => ({
    usePayoff: () => ({ setCallback: jest.fn(), openPayoffBatchModal, payOffPayment: jest.fn() }),
    PayoffProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/tags", () => ({
    useTags: () => ({
        data: [],
        loading: false,
        handleOnOpenDrawer: jest.fn(),
        handleOnCloseDrawer: jest.fn(),
        openDrawer: false,
        isLoadingTagDetails: false,
        tagDetails: undefined,
        onUpdateTagDetail: jest.fn(),
        onCreateNewTag: jest.fn(),
    }),
    TagsProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/csvImport", () => ({
    useCsvImportProvider: () => ({ setOpenModal: setOpenCsvImportModal }),
    CsvImportProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/budget", () => ({
    BudgetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/providers/report", () => ({
    useReport: () => ({ hasAnyData: true, isLoadingPage: false }),
    ReportProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/app/internal/financial/report/components", () => ({
    ReportCharts: () => <div>report-charts</div>,
    ReportError: () => <div>report-error</div>,
    ReportFilters: () => <div>report-filters</div>,
    ReportHeader: () => <div>report-header</div>,
    ReportInsights: () => <div>report-insights</div>,
    ReportMonthlyHistory: () => <div>report-monthly-history</div>,
    ReportStats: () => <div>report-stats</div>,
}));

jest.mock("@/util/index", () => {
    const actual = jest.requireActual("@/util/index");
    return {
        ...actual,
        updateSearchParams: (...args: unknown[]) => updateSearchParamsMock(...args),
    };
});

jest.mock("@tanstack/react-query", () => ({
    useQuery: () => ({
        data: {
            data: [
                {
                    id: 1,
                    name: "Jan",
                    date: "2024-01-01",
                    total_value_credit: 100,
                    total_value_debit: 50,
                    total_value_open: 10,
                    total_value_closed: 40,
                    total_payments: 2,
                },
            ],
        },
        isLoading: false,
    }),
}));

jest.mock("@/services/financial/report", () => ({
    fetchMonthPayments: jest.fn(),
}));

describe("internal pages and layouts", () => {
    test("renderiza layouts internos", () => {
        render(
            <>
                <InternalLayout>
                    <div>c1</div>
                </InternalLayout>
                <AdminLayout>
                    <div>ca</div>
                </AdminLayout>
                <DashboardFinancialLayout>
                    <div>c2</div>
                </DashboardFinancialLayout>
                <BillsLayout>
                    <div>c3</div>
                </BillsLayout>
                <BudgetLayout>
                    <div>c4</div>
                </BudgetLayout>
                <EarningsLayout>
                    <div>c5</div>
                </EarningsLayout>
                <InvoicesLayout>
                    <div>c6</div>
                </InvoicesLayout>
                <ReportLayout>
                    <div>c7</div>
                </ReportLayout>
                <ScheduledBillsLayout>
                    <div>c8</div>
                </ScheduledBillsLayout>
                <TagsLayout>
                    <div>c9</div>
                </TagsLayout>
            </>,
        );

        expect(screen.getAllByText("menu-internal").length).toBeGreaterThan(0);
        expect(screen.getAllByText("login-header").length).toBeGreaterThan(0);
        expect(screen.getByText("ca")).toBeInTheDocument();
        expect(screen.getByText("c9")).toBeInTheDocument();
    });

    test("renderiza dashboard financeiro", () => {
        render(<DashboardPage />);
        expect(screen.getByText("Dashboard Financeiro")).toBeInTheDocument();
        expect(screen.getByText("dashboard-metrics")).toBeInTheDocument();
        expect(screen.getByText("Notas vencidas")).toBeInTheDocument();
    });

    test("renderiza páginas de contas e notas", () => {
        render(
            <>
                <BillsPage searchParams={{}} />
                <EarningsPage searchParams={{}} />
                <InvoicesPage searchParams={{}} />
                <ScheduledBillsPage searchParams={{}} />
            </>,
        );

        expect(screen.getAllByText("payments-table").length).toBeGreaterThan(0);
        expect(screen.getAllByText("invoices-table").length).toBeGreaterThan(0);
        expect(screen.getAllByText("invoice-drawer").length).toBeGreaterThan(0);
        expect(screen.getByText("csv-import-modal")).toBeInTheDocument();
    });

    test("aciona ações de filtro nas páginas", () => {
        render(
            <>
                <BillsPage searchParams={{}} />
                <EarningsPage searchParams={{}} />
            </>,
        );

        fireEvent.click(screen.getAllByText("Limpar filtros")[0]);
        expect(cleanFilter).toHaveBeenCalled();
    });

    test("renderiza budget, monthly, tags e report", () => {
        render(
            <>
                <BudgetPage />
                <MonthlyPage />
                <TagsPage />
                <ReportPage />
            </>,
        );

        expect(screen.getByText("Orçamento doméstico")).toBeInTheDocument();
        expect(screen.getByText("budget-report")).toBeInTheDocument();
        expect(screen.getByText("budget-goals")).toBeInTheDocument();
        expect(screen.getByText("tag-drawer")).toBeInTheDocument();
    });
});
