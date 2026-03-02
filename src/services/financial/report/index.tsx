import { apiDjango } from "@/services";

export interface FinancialReportFilters {
    date_from?: string;
    date_to?: string;
}

const withReportFilters = (filters?: FinancialReportFilters) => {
    if (!filters) {
        return undefined;
    }

    const params: FinancialReportFilters = {};

    if (filters.date_from) {
        params.date_from = filters.date_from;
    }
    if (filters.date_to) {
        params.date_to = filters.date_to;
    }

    return Object.keys(params).length > 0 ? { params } : undefined;
};

// Tipos para /financial/report/
export interface IPaymentChartData {
    label: string;
    debit: number;
    credit: number;
    total: number;
    difference: number;
    accumulated: number;
}

export interface IPaymentReportResponse {
    data: {
        payments: IPaymentChartData[];
        fixed_debit: number;
        fixed_credit: number;
    };
}

// Tipos para /financial/payment/month/
export interface IPaymentMonth {
    id: number;
    name: string;
    date: string;
    dateTimestamp: number;
    total: number;
    total_value_credit: number;
    total_value_debit: number;
    total_value_open: number;
    total_value_closed: number;
    total_payments: number;
}

export interface IPaymentMonthResponse {
    data: IPaymentMonth[];
}

// Tipos para /financial/report/count_payment
export interface ICountPaymentResponse {
    data: number;
}

// Tipos para /financial/report/amount_payment
export interface IAmountPaymentResponse {
    data: number;
}

// Tipos para /financial/report/amount_payment_open
export interface IAmountPaymentOpenResponse {
    data: number;
}

// Tipos para /financial/report/amount_payment_closed
export interface IAmountPaymentClosedResponse {
    data: number;
}

// Tipos para /financial/report/amount_invoice_by_tag
export interface IInvoiceByTag {
    id: number;
    name: string;
    color: string;
    amount: number;
}

export interface IInvoiceByTagResponse {
    data: IInvoiceByTag[];
}

// Tipos para /financial/report/amount_forecast_value
export interface IAmountForecastValueResponse {
    data: number;
}

export interface MetricData {
    value: number;
    metric_value: number;
}

export interface GrowthData {
    value: number;
}

export interface FinancialMetricsResponse {
    revenues: MetricData;
    expenses: MetricData;
    profit: MetricData;
    growth: GrowthData;
}

// Atualizando as funcoes de servico com os tipos corretos
export const fetchMonthPayments = async (filters?: FinancialReportFilters): Promise<IPaymentMonthResponse> => {
    const response = await apiDjango.get<IPaymentMonthResponse>("/financial/payment/month/", withReportFilters(filters));
    return response.data;
};

export const fetchPaymentReportService = async (
    filters?: FinancialReportFilters,
): Promise<IPaymentReportResponse["data"]> => {
    const response = await apiDjango.get<IPaymentReportResponse>("/financial/report/", withReportFilters(filters));
    return response.data.data;
};

export const fetchCountPaymentReportService = async (filters?: FinancialReportFilters): Promise<number> => {
    const response = await apiDjango.get<ICountPaymentResponse>(
        "/financial/report/count_payment",
        withReportFilters(filters),
    );
    return response.data.data;
};

export const fetchAmountPaymentReportService = async (filters?: FinancialReportFilters): Promise<number> => {
    const response = await apiDjango.get<IAmountPaymentResponse>("/financial/report/amount_payment", withReportFilters(filters));
    return response.data.data;
};

export const fetchAmountPaymentOpenReportService = async (filters?: FinancialReportFilters): Promise<number> => {
    const response = await apiDjango.get<IAmountPaymentOpenResponse>(
        "/financial/report/amount_payment_open",
        withReportFilters(filters),
    );
    return response.data.data;
};

export const fetchAmountPaymentClosedReportService = async (filters?: FinancialReportFilters): Promise<number> => {
    const response = await apiDjango.get<IAmountPaymentClosedResponse>(
        "/financial/report/amount_payment_closed",
        withReportFilters(filters),
    );
    return response.data.data;
};

export const fetchAmountInvoiceByTagReportService = async (
    filters?: FinancialReportFilters,
): Promise<IInvoiceByTag[]> => {
    const response = await apiDjango.get<IInvoiceByTagResponse>(
        "/financial/report/amount_invoice_by_tag",
        withReportFilters(filters),
    );
    return response.data.data;
};

export const fetchAmountForecastValueService = async (filters?: FinancialReportFilters): Promise<number> => {
    const response = await apiDjango.get<IAmountForecastValueResponse>(
        "/financial/report/amount_forecast_value",
        withReportFilters(filters),
    );
    return response.data.data;
};

export const fetchFinancialMetricsService = async (
    filters?: FinancialReportFilters,
): Promise<FinancialMetricsResponse> => {
    const response = await apiDjango.get<FinancialMetricsResponse>("/financial/report/metrics/", withReportFilters(filters));
    return response.data;
};
