import {
    fetchAllInvoiceService,
    fetchDetailInvoiceService,
    fetchDetailInvoicePaymentsService,
    includeNewInvoiceService,
    saveInvoiceService,
} from ".";
import { apiDjango } from "@/services";
import { IInvoiceFilters } from "@/components/providers/invoices";
import { IPaymentFilters } from "@/components/providers/payments";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;
const mockedPost = apiDjango.post as jest.Mock;

describe("invoicesService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchAllInvoiceService", () => {
        it("chama GET /financial/invoice/ com filtros e retorna data", async () => {
            const filters: IInvoiceFilters = { page: 1, page_size: 10 };
            const mockData = { data: { current_page: 1, total_pages: 1, page_size: 10, has_previous: false, has_next: false, data: [] } };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchAllInvoiceService(filters);

            expect(mockedGet).toHaveBeenCalledWith("/financial/invoice/", { params: filters });
            expect(result).toEqual(mockData);
        });
    });

    describe("fetchDetailInvoiceService", () => {
        it("chama GET /financial/invoice/:id/ e retorna data", async () => {
            const mockData = { data: { id: 3, name: "Conta de Luz" } };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchDetailInvoiceService(3);

            expect(mockedGet).toHaveBeenCalledWith("/financial/invoice/3/");
            expect(result).toEqual(mockData);
        });
    });

    describe("fetchDetailInvoicePaymentsService", () => {
        it("chama GET /financial/invoice/:id/payments/ com filtros e retorna data", async () => {
            const filters: IPaymentFilters = { page: 1, page_size: 5 };
            const mockData = { data: { current_page: 1, total_pages: 1, page_size: 5, has_previous: false, has_next: false, data: [] } };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await fetchDetailInvoicePaymentsService(3, filters);

            expect(mockedGet).toHaveBeenCalledWith("/financial/invoice/3/payments/", { params: filters });
            expect(result).toEqual(mockData);
        });
    });

    describe("includeNewInvoiceService", () => {
        it("chama POST /financial/invoice/new/ e retorna data", async () => {
            const newInvoice = {
                status: 0,
                name: "Nova Nota",
                date: "2024-01-01",
                installments: 1,
                payment_date: "2024-01-15",
                fixed: false,
                active: true,
                value: 100,
                tags: [1],
                type: "debit",
            };
            const mockData = { msg: "Nota criada" };
            mockedPost.mockResolvedValueOnce({ data: mockData });

            const result = await includeNewInvoiceService(newInvoice);

            expect(mockedPost).toHaveBeenCalledWith("/financial/invoice/new/", newInvoice);
            expect(result).toEqual(mockData);
        });
    });

    describe("saveInvoiceService", () => {
        it("chama POST /financial/invoice/:id/save/ e retorna data", async () => {
            const invoice = { id: 3, name: "Conta Editada", date: "2024-01-01", active: true, tags: [1] };
            const mockData = { msg: "Nota salva" };
            mockedPost.mockResolvedValueOnce({ data: mockData });

            const result = await saveInvoiceService(invoice);

            expect(mockedPost).toHaveBeenCalledWith("/financial/invoice/3/save/", invoice);
            expect(result).toEqual(mockData);
        });
    });
});
