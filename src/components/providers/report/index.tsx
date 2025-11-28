"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    fetchAmountForecastValueService,
    fetchAmountInvoiceByTagReportService,
    fetchAmountPaymentClosedReportService,
    fetchAmountPaymentOpenReportService,
    fetchAmountPaymentReportService,
    fetchCountPaymentReportService,
    fetchMonthPayments,
    fetchPaymentReportService,
} from "@/services/financial/report";

export interface IInvoiceByTag {
    id: number;
    name: string;
    color: string;
    amount: number;
}

export interface IPaymentCharts {
    label: string;
    debit: number;
    credit: number;
    total: number;
    difference: number;
    accumulated: number;
}

export interface IPaymentMonth {
    id: number;
    name: string;
    total_value_credit: number;
    total_value_debit: number;
    total_value_open: number;
    total_value_closed: number;
    total_payments: number;
}

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
};

const ReportContext = createContext({} as ReportContextData);

type ReportProviderProps = {
    children: ReactNode;
};

export function ReportProvider({ children }: ReportProviderProps) {
    // 1. Busca os pagamentos e valores fixos
    const { data: paymentData, isLoading: isLoadingPayments } = useQuery({
        queryKey: ["paymentReport"],
        queryFn: fetchPaymentReportService,
    });

    const { data: monthData, isLoading: isLoadingMonth } = useQuery({
        queryKey: ["month"],
        queryFn: fetchMonthPayments,
    });

    // 2. Contagem de pagamentos
    const { data: countPayment, isLoading: isLoadingCountPayment } = useQuery({
        queryKey: ["countPayment"],
        queryFn: fetchCountPaymentReportService,
    });

    // 3. Valor total dos pagamentos
    const { data: amountPayment, isLoading: isLoadingAmountPayment } = useQuery({
        queryKey: ["amountPayment"],
        queryFn: fetchAmountPaymentReportService,
    });

    // 4. Pagamentos em aberto
    const { data: amountPaymentOpen, isLoading: isLoadingAmountPaymentOpen } = useQuery({
        queryKey: ["amountPaymentOpen"],
        queryFn: fetchAmountPaymentOpenReportService,
    });

    // 5. Pagamentos fechados
    const { data: amountPaymentClosed, isLoading: isLoadingAmountPaymentClosed } = useQuery({
        queryKey: ["amountPaymentClosed"],
        queryFn: fetchAmountPaymentClosedReportService,
    });

    // 6. Faturas por tag
    const { data: invoiceByTag, isLoading: isLoadingInvoiceByTag } = useQuery({
        queryKey: ["invoiceByTag"],
        queryFn: fetchAmountInvoiceByTagReportService,
    });

    // 7. Valor previsto
    const { data: amountForecastValue, isLoading: isLoadingAmountForecastValue } = useQuery({
        queryKey: ["amountForecastValue"],
        queryFn: fetchAmountForecastValueService,
    });

    const contextValue: ReportContextData = {
        payments: {
            data: paymentData?.payments || [],
            isLoading: isLoadingPayments,
        },
        fixed_credit: {
            data: paymentData?.fixed_credit || 0,
            isLoading: isLoadingPayments,
        },
        fixed_debit: {
            data: paymentData?.fixed_debit || 0,
            isLoading: isLoadingPayments,
        },
        invoiceByTag: {
            data: invoiceByTag || [],
            isLoading: isLoadingInvoiceByTag,
        },
        countPayment: {
            data: countPayment || 0,
            isLoading: isLoadingCountPayment,
        },
        amountPayment: {
            data: amountPayment || 0,
            isLoading: isLoadingAmountPayment,
        },
        amountPaymentClosed: {
            data: amountPaymentClosed || 0,
            isLoading: isLoadingAmountPaymentClosed,
        },
        amountPaymentOpen: {
            data: amountPaymentOpen || 0,
            isLoading: isLoadingAmountPaymentOpen,
        },
        amountForecastValue: {
            data: amountForecastValue || 0,
            isLoading: isLoadingAmountForecastValue,
        },
        month: {
            data: monthData?.data || [],
            isLoading: isLoadingMonth,
        },
    };

    return <ReportContext.Provider value={contextValue}>{children}</ReportContext.Provider>;
}

export function useReport() {
    const context = useContext(ReportContext);

    if (!context) {
        throw new Error("useReport must be used within a ReportProvider");
    }

    return context;
}
