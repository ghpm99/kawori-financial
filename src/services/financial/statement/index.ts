import { apiDjango } from "@/services";

export interface StatementTransaction {
    id: number;
    name: string;
    description: string;
    payment_date: string;
    date: string;
    type: number;
    value: number;
    running_balance: number;
    invoice_name: string | null;
    tags: { id: number; name: string; color: string }[];
}

export interface StatementSummary {
    opening_balance: number;
    total_credits: number;
    total_debits: number;
    closing_balance: number;
}

export interface StatementData {
    summary: StatementSummary;
    transactions: StatementTransaction[];
}

export interface StatementResponse {
    data: StatementData;
}

export interface StatementFilters {
    date_from: string;
    date_to: string;
}

export async function fetchStatementService(filters: StatementFilters): Promise<StatementData> {
    const response = await apiDjango.get<StatementResponse>("/financial/payment/statement/", {
        params: filters,
    });
    return response.data.data;
}
