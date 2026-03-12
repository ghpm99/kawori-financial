import { fetchStatementService, StatementFilters } from ".";
import { apiDjango } from "@/services";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;

describe("statementService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchStatementService", () => {
        it("chama GET /financial/payment/statement/ com filtros e retorna data", async () => {
            const filters: StatementFilters = {
                date_from: "2026-01-01",
                date_to: "2026-01-31",
            };
            const mockData = {
                data: {
                    summary: {
                        opening_balance: 1000,
                        total_credits: 5000,
                        total_debits: 3000,
                        closing_balance: 3000,
                    },
                    transactions: [
                        {
                            id: 1,
                            name: "Salário",
                            description: "",
                            payment_date: "2026-01-05",
                            date: "2026-01-05",
                            type: 0,
                            value: 5000,
                            running_balance: 6000,
                            invoice_name: null,
                            tags: [],
                        },
                        {
                            id: 2,
                            name: "Aluguel",
                            description: "",
                            payment_date: "2026-01-10",
                            date: "2026-01-10",
                            type: 1,
                            value: 3000,
                            running_balance: 3000,
                            invoice_name: "Fatura Jan",
                            tags: [{ id: 1, name: "Moradia", color: "#ff0000" }],
                        },
                    ],
                },
            };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchStatementService(filters);

            expect(mockedGet).toHaveBeenCalledWith("/financial/payment/statement/", {
                params: filters,
            });
            expect(result).toEqual(mockData.data);
        });

        it("propaga erro quando a requisição falha", async () => {
            const filters: StatementFilters = {
                date_from: "2026-01-01",
                date_to: "2026-01-31",
            };
            mockedGet.mockRejectedValueOnce(new Error("Network Error"));

            await expect(fetchStatementService(filters)).rejects.toThrow("Network Error");
        });
    });
});
