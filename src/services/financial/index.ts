import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiDjango } from "..";

export async function fetchAllPaymentService(filters: IPaymentFilters) {
    const response = await apiDjango.get<PaymentsApiResponse>("/financial/payment/", {
        params: filters,
    });
    return response.data;
}

export async function saveNewPaymentService(data: INewPaymentRequest) {
    const response = await apiDjango.post("/financial/payment/new", data);
    return response.data;
}

export async function fetchDetailPaymentService(id: number) {
    const response = await apiDjango.get(`/financial/payment/${id}/`);
    return response.data;
}

export async function savePaymentDetailService(id: number, payment: ISavePaymentRequest) {
    const response = await apiDjango.post(`/financial/payment/${id}/save`, payment);
    return response.data;
}

export async function payoffPaymentService(id: number) {
    const response = await apiDjango.post(`/financial/payment/${id}/payoff`);
    return response.data;
}

export async function fetchPaymentReportService() {
    const response = await apiDjango.get("/financial/report/");
    return response.data;
}

export async function fetchCountPaymentReportService() {
    const response = await apiDjango.get("/financial/report/count_payment");
    return response.data;
}

export async function fetchAmountPaymentReportService() {
    const response = await apiDjango.get("/financial/report/amount_payment");
    return response.data;
}

export async function fetchAmountPaymentOpenReportService() {
    const response = await apiDjango.get("/financial/report/amount_payment_open");
    return response.data;
}

export async function fetchAmountPaymentClosedReportService() {
    const response = await apiDjango.get("/financial/report/amount_payment_closed");
    return response.data;
}

export async function fetchAmountInvoiceByTagReportService() {
    const response = await apiDjango.get("/financial/report/amount_invoice_by_tag");
    return response.data;
}

export async function fetchAllContractService(filters: IContractFilters) {
    const response = await apiDjango.get("/financial/contract/", {
        params: filters,
    });
    return response.data;
}

export async function fetchAllInvoiceService(filters: IInvoiceFilters) {
    const response = await apiDjango.get("/financial/invoice/", {
        params: filters,
    });
    return response.data;
}

export async function saveNewContractService(data: INewContractRequest) {
    const response = await apiDjango.post<{ data: IContractPagination }>("/financial/contract/new", data);
    return response.data;
}

export async function fetchDetailContractService(id: number) {
    const response = await apiDjango.get(`/financial/contract/${id}/`);
    return response.data;
}

export async function fetchDetailContractInvoicesService(id: number, filters: IInvoiceFilters) {
    const response = await apiDjango.get(`/financial/contract/${id}/invoices/`, {
        params: filters,
    });
    return response.data;
}

export async function includeNewInvoiceService(data: INewInvoiceRequest) {
    const response = await apiDjango.post(`/financial/contract/${data.idContract}/invoice/`, data);
    return response.data;
}

export async function fetchDetailInvoiceService(id: number) {
    const response = await apiDjango.get(`/financial/invoice/${id}/`);
    return response.data;
}

export async function fetchDetailInvoicePaymentsService(id: number, filters: IPaymentFilters) {
    const response = await apiDjango.get(`/financial/invoice/${id}/payments/`, {
        params: filters,
    });
    return response.data;
}

export async function mergeContractService(data: IMergeContractRequest) {
    const response = await apiDjango.post(`/financial/contract/${data.id}/merge/`, data);
    return response.data;
}

export async function fetchTagsService() {
    const response = await apiDjango.get("/financial/tag/");
    return response.data;
}

export async function includeNewTagService(tag: { name: string }) {
    const response = await apiDjango.post("/financial/tag/new", tag);
    return response.data;
}

export async function saveInvoiceTagsService(idInvoice: number, tags: number[]) {
    const response = await apiDjango.post(`/financial/invoice/${idInvoice}/tags`, tags);
    return response;
}

export async function updateAllContractsValue() {
    const response = await apiDjango.post("/financial/contract/update_all_contracts_value");
    return response;
}
