import { fetchAllPaymentService, fetchDetailPaymentService, savePaymentDetailService } from ".";
import { apiDjango } from "@/services";
import { IPaymentFilters } from "@/components/providers/payments";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;
const mockedPost = apiDjango.post as jest.Mock;

describe("paymentsService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchAllPaymentService", () => {
        it("chama GET /financial/payment/ com filtros e retorna data", async () => {
            const filters: IPaymentFilters = { page: 1, page_size: 10, status: "open" };
            const mockData = { data: { current_page: 1, total_pages: 1, page_size: 10, has_previous: false, has_next: false, data: [] } };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchAllPaymentService(filters);

            expect(mockedGet).toHaveBeenCalledWith("/financial/payment/", { params: filters });
            expect(result).toEqual(mockData);
        });
    });

    describe("fetchDetailPaymentService", () => {
        it("chama GET /financial/payment/:id/ e retorna data", async () => {
            const mockData = { data: { id: 5, name: "Pagamento Teste" } };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchDetailPaymentService(5);

            expect(mockedGet).toHaveBeenCalledWith("/financial/payment/5/");
            expect(result).toEqual(mockData);
        });
    });

    describe("savePaymentDetailService", () => {
        it("chama POST /financial/payment/:id/save e retorna data", async () => {
            const payload = { name: "Pagamento Editado", value: 150, fixed: false };
            const mockData = { msg: "Salvo com sucesso" };
            mockedPost.mockResolvedValueOnce({ data: mockData });

            const result = await savePaymentDetailService(5, payload);

            expect(mockedPost).toHaveBeenCalledWith("/financial/payment/5/save", payload);
            expect(result).toEqual(mockData);
        });
    });
});
