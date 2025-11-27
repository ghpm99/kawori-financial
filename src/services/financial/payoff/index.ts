import { apiDjango } from "@/services";

export async function payoffPaymentService(id: number) {
    const response = await apiDjango.post<{ msg: string }>(`/financial/payment/${id}/payoff`);
    return response.data;
}
