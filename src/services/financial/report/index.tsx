import { apiDjango } from "@/services";

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

// Atualizando as funções de serviço com os tipos corretos
export const fetchMonthPayments = async (): Promise<IPaymentMonthResponse> => {
    const response = await apiDjango.get<IPaymentMonthResponse>("/financial/payment/month/");
    return response.data;
};

export const fetchPaymentReportService = async (): Promise<IPaymentReportResponse["data"]> => {
    const response = await apiDjango.get<IPaymentReportResponse>("/financial/report/");
    return response.data.data;
};

export const fetchCountPaymentReportService = async (): Promise<number> => {
    const response = await apiDjango.get<ICountPaymentResponse>("/financial/report/count_payment");
    return response.data.data;
};

export const fetchAmountPaymentReportService = async (): Promise<number> => {
    const response = await apiDjango.get<IAmountPaymentResponse>("/financial/report/amount_payment");
    return response.data.data;
};

export const fetchAmountPaymentOpenReportService = async (): Promise<number> => {
    const response = await apiDjango.get<IAmountPaymentOpenResponse>("/financial/report/amount_payment_open");
    return response.data.data;
};

export const fetchAmountPaymentClosedReportService = async (): Promise<number> => {
    const response = await apiDjango.get<IAmountPaymentClosedResponse>("/financial/report/amount_payment_closed");
    return response.data.data;
};

export const fetchAmountInvoiceByTagReportService = async (): Promise<IInvoiceByTag[]> => {
    const response = await apiDjango.get<IInvoiceByTagResponse>("/financial/report/amount_invoice_by_tag");
    return response.data.data;
};

export const fetchAmountForecastValueService = async (): Promise<number> => {
    const response = await apiDjango.get<IAmountForecastValueResponse>("/financial/report/amount_forecast_value");
    return response.data.data;
};
