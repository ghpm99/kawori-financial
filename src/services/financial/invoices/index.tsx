import { IInvoiceDetail, IInvoiceFilters, InvoicesPage } from "@/components/providers/invoices";
import { IPaymentFilters, PaymentsPage } from "@/components/providers/payments";
import { apiDjango } from "@/services";

interface INewInvoiceRequest {
    status: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    active: boolean;
    value: number;
    tags: number[];
}

interface ISaveInvoiceRequest {
    id: number;
    name: string;
    date: string;
    active: boolean;
    tags: number[];
}

export async function fetchAllInvoiceService(filters: IInvoiceFilters) {
    const response = await apiDjango.get<{ data: InvoicesPage }>("/financial/invoice/", {
        params: filters,
    });
    return response.data;
}

export async function fetchDetailInvoicePaymentsService(id: number, filters: IPaymentFilters) {
    const response = await apiDjango.get<{ data: PaymentsPage }>(`/financial/invoice/${id}/payments/`, {
        params: filters,
    });
    return response.data;
}

export async function fetchDetailInvoiceService(id: number) {
    const response = await apiDjango.get<{ data: IInvoiceDetail }>(`/financial/invoice/${id}/`);
    return response.data;
}

export async function includeNewInvoiceService(data: INewInvoiceRequest) {
    const response = await apiDjango.post<CommonApiResponse>(`/financial/invoice/new/`, data);
    return response.data;
}

export async function saveInvoiceService(invoice: ISaveInvoiceRequest) {
    const response = await apiDjango.post<CommonApiResponse>(`/financial/invoice/${invoice.id}/save/`, invoice);
    return response.data;
}
