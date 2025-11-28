import { IBudget } from "@/components/providers/budget";
import { apiDjango } from "@/services";

export async function fetchAllBudgetService(period: string) {
    const response = await apiDjango.get<{ data: IBudget[] }>("/financial/budget/", {
        params: { period },
    });
    return response.data;
}

export async function saveBudgetService(budgetList: IBudget[]) {
    const response = await apiDjango.post<CommonApiResponse>("/financial/budget/save", { data: budgetList });
    return response.data;
}

export async function resetBudgetService() {
    const response = await apiDjango.get<CommonApiResponse>("/financial/budget/reset");
    return response.data;
}
