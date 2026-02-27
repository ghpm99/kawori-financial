import { payoffPaymentService } from ".";
import { apiDjango } from "@/services";

jest.mock("@/services", () => ({
    apiDjango: {
        post: jest.fn(),
    },
}));

const mockedPost = apiDjango.post as jest.Mock;

describe("payoffPaymentService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("chama POST /financial/payment/:id/payoff e retorna data", async () => {
        const mockResponse = { msg: "Pagamento baixado com sucesso" };
        mockedPost.mockResolvedValueOnce({ data: mockResponse });

        const result = await payoffPaymentService(42);

        expect(mockedPost).toHaveBeenCalledWith("/financial/payment/42/payoff");
        expect(result).toEqual(mockResponse);
    });

    it("propaga erro quando a requisição falha", async () => {
        const error = new Error("Network error");
        mockedPost.mockRejectedValueOnce(error);

        await expect(payoffPaymentService(1)).rejects.toThrow("Network error");
    });
});
