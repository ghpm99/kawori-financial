import { fetchAllBudgetService, saveBudgetService, resetBudgetService } from ".";
import { apiDjango } from "@/services";
import { IBudget } from "@/components/providers/budget";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;
const mockedPost = apiDjango.post as jest.Mock;

const mockBudget: IBudget = {
    id: 1,
    name: "Alimentação",
    allocation_percentage: 20,
    estimated_expense: 500,
    actual_expense: 350,
    difference: 150,
    color: "#ff0000",
};

describe("budgetService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchAllBudgetService", () => {
        it("chama GET /financial/budget/ com period e retorna data", async () => {
            const mockData = { data: [mockBudget] };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchAllBudgetService("2024-01");

            expect(mockedGet).toHaveBeenCalledWith("/financial/budget/", { params: { period: "2024-01" } });
            expect(result).toEqual(mockData);
        });
    });

    describe("saveBudgetService", () => {
        it("chama POST /financial/budget/save e retorna data", async () => {
            const mockData = { msg: "Budget salvo" };
            mockedPost.mockResolvedValueOnce({ data: mockData });

            const result = await saveBudgetService([mockBudget]);

            expect(mockedPost).toHaveBeenCalledWith("/financial/budget/save", { data: [mockBudget] });
            expect(result).toEqual(mockData);
        });
    });

    describe("resetBudgetService", () => {
        it("chama GET /financial/budget/reset e retorna data", async () => {
            const mockData = { msg: "Budget resetado" };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await resetBudgetService();

            expect(mockedGet).toHaveBeenCalledWith("/financial/budget/reset");
            expect(result).toEqual(mockData);
        });
    });
});
