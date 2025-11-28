import { ITags } from "@/components/providers/tags";
import { apiDjango } from "@/services";

export async function fetchDetailTagService(id: number) {
    const response = await apiDjango.get<{ data: ITags }>(`/financial/tag/${id}/`);
    return response.data;
}

export async function fetchTagsService() {
    const response = await apiDjango.get<{ data: ITags[] }>("/financial/tag/");
    return response.data;
}

export async function saveTagService(tag: ITags) {
    const response = await apiDjango.post<CommonApiResponse>(`/financial/tag/${tag.id}/save`, tag);
    return response;
}
