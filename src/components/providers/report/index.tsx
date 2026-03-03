"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo } from "react";

import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Dayjs } from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
    FinancialReportFilters,
    IInvoiceByTag,
    IPaymentChartData,
    IPaymentMonth,
    fetchAmountForecastValueService,
    fetchAmountInvoiceByTagReportService,
    fetchAmountPaymentClosedReportService,
    fetchAmountPaymentOpenReportService,
    fetchAmountPaymentReportService,
    fetchCountPaymentReportService,
    fetchFinancialMetricsService,
    fetchMonthPayments,
    fetchPaymentReportService,
} from "@/services/financial/report";
import { formatMoney, formatterMonthYearDate, getStringValue, updateSearchParams } from "@/util";

type ReportTrendPoint = {
    month: string;
    credit: number;
    debit: number;
    difference: number;
    accumulated: number;
};

type ReportMonthTableRow = IPaymentMonth & {
    key: number;
    month: string;
};

type PaymentStatusPoint = {
    name: string;
    value: number;
};

type CoverageRow = {
    key: string;
    label: string;
    value: string;
};

type ReportKpis = {
    revenues: number;
    expenses: number;
    profit: number;
    growth: number;
    savingsRate: number;
    averageTicket: number;
    openShare: number;
    closedShare: number;
    totalPayments: number;
    totalOpen: number;
    totalClosed: number;
    totalCount: number;
    forecast: number;
    forecastAccuracy: number;
    forecastGap: number;
    fixedCredit: number;
    fixedDebit: number;
};

type ReportContextData = {
    payments: {
        data: IPaymentCharts[];
        isLoading: boolean;
    };
    fixed_credit: {
        data: number;
        isLoading: boolean;
    };
    fixed_debit: {
        data: number;
        isLoading: boolean;
    };
    invoiceByTag: {
        data: IInvoiceByTag[];
        isLoading: boolean;
    };
    countPayment: {
        data: number;
        isLoading: boolean;
    };
    amountPayment: {
        data: number;
        isLoading: boolean;
    };
    amountPaymentClosed: {
        data: number;
        isLoading: boolean;
    };
    amountPaymentOpen: {
        data: number;
        isLoading: boolean;
    };
    amountForecastValue: {
        data: number;
        isLoading: boolean;
    };
    month: {
        data: IPaymentMonth[];
        isLoading: boolean;
    };
    activeFilters: FinancialReportFilters;
    applyDateRange: (period?: [Dayjs, Dayjs]) => void;
    clearFilters: () => void;
    isLoadingPage: boolean;
    isFetchingPage: boolean;
    errorMessage?: string;
    hasAnyData: boolean;
    trendData: ReportTrendPoint[];
    tableData: ReportMonthTableRow[];
    invoiceByTagData: Awaited<ReturnType<typeof fetchAmountInvoiceByTagReportService>>;
    paymentStatusData: PaymentStatusPoint[];
    insights: string[];
    coverageData: CoverageRow[];
    kpis: ReportKpis;
};

const ReportContext = createContext<ReportContextData | undefined>(undefined);

export type IPaymentCharts = IPaymentChartData;
export type { IPaymentMonth, IInvoiceByTag };

const normalizeFilters = (filters: FinancialReportFilters): FinancialReportFilters => {
    const normalized: FinancialReportFilters = {};

    if (filters.date_from?.trim()) {
        normalized.date_from = filters.date_from.trim();
    }

    if (filters.date_to?.trim()) {
        normalized.date_to = filters.date_to.trim();
    }

    return normalized;
};

const getFiltersFromSearchParams = (searchParams: URLSearchParams): FinancialReportFilters =>
    normalizeFilters({
        date_from: getStringValue(searchParams.get("date_from") ?? undefined),
        date_to: getStringValue(searchParams.get("date_to") ?? undefined),
    });

const percentage = (value: number, total: number): number => {
    if (total <= 0) {
        return 0;
    }

    return Number(((value / total) * 100).toFixed(1));
};

const toMonthTrend = (payments: IPaymentChartData[]): ReportTrendPoint[] =>
    payments.map((entry) => ({
        month: formatterMonthYearDate(entry.label),
        credit: entry.credit,
        debit: entry.debit,
        difference: entry.difference,
        accumulated: entry.accumulated,
    }));

const toMonthTable = (rows: IPaymentMonth[]): ReportMonthTableRow[] =>
    rows.map((entry) => ({
        ...entry,
        key: entry.id,
        month: formatterMonthYearDate(entry.date || entry.name),
    }));

export function ReportProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const activeFilters = useMemo(() => getFiltersFromSearchParams(searchParams), [searchParams]);

    const paymentsQuery = useQuery({
        queryKey: ["financial-report", "payments", activeFilters],
        queryFn: () => fetchPaymentReportService(activeFilters),
    });

    const monthQuery = useQuery({
        queryKey: ["financial-report", "month", activeFilters],
        queryFn: () => fetchMonthPayments(activeFilters),
    });

    const countPaymentQuery = useQuery({
        queryKey: ["financial-report", "count-payment", activeFilters],
        queryFn: () => fetchCountPaymentReportService(activeFilters),
    });

    const amountPaymentQuery = useQuery({
        queryKey: ["financial-report", "amount-payment", activeFilters],
        queryFn: () => fetchAmountPaymentReportService(activeFilters),
    });

    const amountPaymentOpenQuery = useQuery({
        queryKey: ["financial-report", "amount-payment-open", activeFilters],
        queryFn: () => fetchAmountPaymentOpenReportService(activeFilters),
    });

    const amountPaymentClosedQuery = useQuery({
        queryKey: ["financial-report", "amount-payment-closed", activeFilters],
        queryFn: () => fetchAmountPaymentClosedReportService(activeFilters),
    });

    const invoiceByTagQuery = useQuery({
        queryKey: ["financial-report", "invoice-by-tag", activeFilters],
        queryFn: () => fetchAmountInvoiceByTagReportService(activeFilters),
    });

    const amountForecastValueQuery = useQuery({
        queryKey: ["financial-report", "forecast", activeFilters],
        queryFn: () => fetchAmountForecastValueService(activeFilters),
    });

    const metricsQuery = useQuery({
        queryKey: ["financial-report", "metrics", activeFilters],
        queryFn: () => fetchFinancialMetricsService(activeFilters),
    });

    const allQueries = [
        paymentsQuery,
        monthQuery,
        countPaymentQuery,
        amountPaymentQuery,
        amountPaymentOpenQuery,
        amountPaymentClosedQuery,
        invoiceByTagQuery,
        amountForecastValueQuery,
        metricsQuery,
    ];

    const isLoadingPage = allQueries.some((query) => query.isLoading);
    const isFetchingPage = allQueries.some((query) => query.isFetching);

    const requestError = allQueries.find((query) => query.error)?.error as AxiosError<{ msg?: string }> | undefined;
    const errorMessage = requestError?.response?.data?.msg || "Nao foi possivel consultar os endpoints de relatorio financeiro.";

    const trendData = useMemo(() => toMonthTrend(paymentsQuery.data?.payments || []), [paymentsQuery.data?.payments]);
    const tableData = useMemo(() => toMonthTable(monthQuery.data?.data || []), [monthQuery.data?.data]);
    const invoiceByTagData = invoiceByTagQuery.data || [];

    const revenues = metricsQuery.data?.revenues.value ?? trendData.reduce((acc, curr) => acc + curr.credit, 0);
    const expenses = metricsQuery.data?.expenses.value ?? trendData.reduce((acc, curr) => acc + curr.debit, 0);
    const profit = metricsQuery.data?.profit.value ?? revenues - expenses;
    const growth = metricsQuery.data?.growth.value ?? 0;
    const totalPayments = amountPaymentQuery.data || 0;
    const totalOpen = amountPaymentOpenQuery.data || 0;
    const totalClosed = amountPaymentClosedQuery.data || 0;
    const totalCount = countPaymentQuery.data || 0;
    const forecast = amountForecastValueQuery.data || 0;
    const fixedCredit = paymentsQuery.data?.fixed_credit || 0;
    const fixedDebit = paymentsQuery.data?.fixed_debit || 0;

    const openShare = percentage(totalOpen, totalPayments);
    const closedShare = percentage(totalClosed, totalPayments);
    const averageTicket = totalCount > 0 ? totalPayments / totalCount : 0;
    const savingsRate = percentage(profit, revenues);
    const forecastAccuracy = forecast > 0 ? percentage(totalPayments, forecast) : 0;
    const forecastGap = totalPayments - forecast;

    const paymentStatusData: PaymentStatusPoint[] = [
        { name: "Pagamentos fechados", value: totalClosed },
        { name: "Pagamentos em aberto", value: totalOpen },
    ];

    const insights = [
        profit >= 0
            ? "Resultado liquido positivo no periodo. Mantenha o ritmo de sobra mensal para criar reserva."
            : "Resultado liquido negativo no periodo. Revisar despesas recorrentes e gastos variaveis e prioridade imediata.",
        openShare > 35
            ? "Alto volume financeiro em aberto. Priorize liquidacao para reduzir risco de atraso e juros."
            : "Volume em aberto controlado para o periodo selecionado.",
        forecast > 0
            ? `Aderencia ao previsto: ${forecastAccuracy.toFixed(1)}%. Diferenca absoluta de ${formatMoney(forecastGap)}.`
            : "Nao ha base prevista para comparar realizado x planejado neste periodo.",
    ];

    const coverageData: CoverageRow[] = [
        {
            key: "total-payments",
            label: "Total movimentado",
            value: formatMoney(totalPayments),
        },
        {
            key: "total-open",
            label: "Total em aberto",
            value: `${formatMoney(totalOpen)} (${openShare.toFixed(1)}%)`,
        },
        {
            key: "total-closed",
            label: "Total fechado",
            value: `${formatMoney(totalClosed)} (${closedShare.toFixed(1)}%)`,
        },
        {
            key: "forecast-accuracy",
            label: "Aderencia ao previsto",
            value: `${forecastAccuracy.toFixed(1)}%`,
        },
        {
            key: "total-count",
            label: "Quantidade de lancamentos",
            value: String(totalCount),
        },
    ];

    const kpis: ReportKpis = {
        revenues,
        expenses,
        profit,
        growth,
        savingsRate,
        averageTicket,
        openShare,
        closedShare,
        totalPayments,
        totalOpen,
        totalClosed,
        totalCount,
        forecast,
        forecastAccuracy,
        forecastGap,
        fixedCredit,
        fixedDebit,
    };

    const hasAnyData = trendData.length > 0 || tableData.length > 0 || invoiceByTagData.length > 0;

    const applyDateRange = useCallback((period?: [Dayjs, Dayjs]) => {
        const nextFilters: FinancialReportFilters = normalizeFilters({
            date_from: period?.[0]?.format("YYYY-MM-DD"),
            date_to: period?.[1]?.format("YYYY-MM-DD"),
        });

        updateSearchParams(router, pathname, nextFilters);
    }, [router, pathname]);

    const clearFilters = useCallback(() => {
        updateSearchParams(router, pathname, {});
    }, [router, pathname]);

    const value = useMemo<ReportContextData>(
        () => ({
            payments: {
                data: paymentsQuery.data?.payments || [],
                isLoading: paymentsQuery.isLoading,
            },
            fixed_credit: {
                data: kpis.fixedCredit,
                isLoading: paymentsQuery.isLoading,
            },
            fixed_debit: {
                data: kpis.fixedDebit,
                isLoading: paymentsQuery.isLoading,
            },
            invoiceByTag: {
                data: invoiceByTagData,
                isLoading: invoiceByTagQuery.isLoading,
            },
            countPayment: {
                data: kpis.totalCount,
                isLoading: countPaymentQuery.isLoading,
            },
            amountPayment: {
                data: kpis.totalPayments,
                isLoading: amountPaymentQuery.isLoading,
            },
            amountPaymentClosed: {
                data: kpis.totalClosed,
                isLoading: amountPaymentClosedQuery.isLoading,
            },
            amountPaymentOpen: {
                data: kpis.totalOpen,
                isLoading: amountPaymentOpenQuery.isLoading,
            },
            amountForecastValue: {
                data: kpis.forecast,
                isLoading: amountForecastValueQuery.isLoading,
            },
            month: {
                data: monthQuery.data?.data || [],
                isLoading: monthQuery.isLoading,
            },
            activeFilters,
            applyDateRange,
            clearFilters,
            isLoadingPage,
            isFetchingPage,
            errorMessage: requestError ? errorMessage : undefined,
            hasAnyData,
            trendData,
            tableData,
            invoiceByTagData,
            paymentStatusData,
            insights,
            coverageData,
            kpis,
        }),
        [
            paymentsQuery.data?.payments,
            paymentsQuery.isLoading,
            invoiceByTagQuery.isLoading,
            countPaymentQuery.isLoading,
            amountPaymentQuery.isLoading,
            amountPaymentClosedQuery.isLoading,
            amountPaymentOpenQuery.isLoading,
            amountForecastValueQuery.isLoading,
            monthQuery.data?.data,
            monthQuery.isLoading,
            activeFilters,
            applyDateRange,
            clearFilters,
            isLoadingPage,
            isFetchingPage,
            requestError,
            errorMessage,
            hasAnyData,
            trendData,
            tableData,
            invoiceByTagData,
            paymentStatusData,
            insights,
            coverageData,
            kpis,
        ],
    );

    return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReport() {
    const context = useContext(ReportContext);

    if (!context) {
        throw new Error("useReport must be used within a ReportProvider");
    }

    return context;
}
