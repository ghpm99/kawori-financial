import { IPaymentFilters, PaymentsPage } from "@/components/providers/payments";
import { apiDjango } from "@/services";

interface ISavePaymentRequest {
    type?: number;
    name?: string;
    payment_date?: string;
    fixed?: boolean;
    active?: boolean;
    value?: number;
}

export async function fetchAllPaymentService(filters: IPaymentFilters) {
    const response = await apiDjango.get<{ data: PaymentsPage }>("/financial/payment/", {
        params: filters,
    });
    return response.data;
}

export async function fetchDetailPaymentService(id: number) {
    const response = await apiDjango.get(`/financial/payment/${id}/`);
    return response.data;
}

export async function savePaymentDetailService(id: number, payment: ISavePaymentRequest) {
    const response = await apiDjango.post<{ msg: string }>(`/financial/payment/${id}/save`, payment);
    return response.data;
}
