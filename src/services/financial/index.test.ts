import { apiDjango } from "..";
import {
    fetchAllPaymentService,
    saveNewPaymentService,
    fetchDetailPaymentService,
    savePaymentDetailService,
    payoffPaymentService,
    fetchPaymentReportService,
    fetchCountPaymentReportService,
    fetchAmountPaymentReportService,
    fetchAmountPaymentOpenReportService,
    fetchAmountPaymentClosedReportService,
    fetchAmountInvoiceByTagReportService,
    fetchAllContractService,
    fetchAllInvoiceService,
    saveNewContractService,
    fetchDetailContractService,
    fetchDetailContractInvoicesService,
    includeNewInvoiceService,
    fetchDetailInvoiceService,
    fetchDetailInvoicePaymentsService,
    mergeContractService,
    fetchTagsService,
    includeNewTagService,
    saveInvoiceTagsService,
    updateAllContractsValue,
} from "./index";

jest.mock("..", () => ({
    apiDjango: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe("Financial Services", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should fetch all payments", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const filters = { status: "paid" };
        const result = await fetchAllPaymentService(filters);

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/", { params: filters });
        expect(result).toBe(mockData.data);
    });

    test("should save a new payment", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const data = { amount: 100 };
        const result = await saveNewPaymentService(data);

        expect(apiDjango.post).toHaveBeenCalledWith("/financial/", data);
        expect(result).toBe(mockData.data);
    });

    test("should fetch payment details", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const result = await fetchDetailPaymentService(id);

        expect(apiDjango.get).toHaveBeenCalledWith(`/financial/${id}/`);
        expect(result).toBe(mockData.data);
    });

    test("should save payment details", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const payment = { amount: 100 };
        const result = await savePaymentDetailService(id, payment);

        expect(apiDjango.post).toHaveBeenCalledWith(`/financial/${id}/save`, payment);
        expect(result).toBe(mockData.data);
    });

    test("should payoff a payment", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const result = await payoffPaymentService(id);

        expect(apiDjango.post).toHaveBeenCalledWith(`/financial/${id}/payoff`);
        expect(result).toBe(mockData.data);
    });

    test("should fetch payment report", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchPaymentReportService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/report/");
        expect(result).toBe(mockData.data);
    });

    test("should fetch count payment report", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchCountPaymentReportService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/report/count_payment");
        expect(result).toBe(mockData.data);
    });

    test("should fetch amount payment report", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchAmountPaymentReportService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/report/amount_payment");
        expect(result).toBe(mockData.data);
    });

    test("should fetch amount payment open report", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchAmountPaymentOpenReportService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/report/amount_payment_open");
        expect(result).toBe(mockData.data);
    });

    test("should fetch amount payment closed report", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchAmountPaymentClosedReportService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/report/amount_payment_closed");
        expect(result).toBe(mockData.data);
    });

    test("should fetch amount invoice by tag report", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchAmountInvoiceByTagReportService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/report/amount_invoice_by_tag");
        expect(result).toBe(mockData.data);
    });

    test("should fetch all contracts", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const filters = { status: "active" };
        const result = await fetchAllContractService(filters);

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/contract/", { params: filters });
        expect(result).toBe(mockData.data);
    });

    test("should fetch all invoices", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const filters = { status: "unpaid" };
        const result = await fetchAllInvoiceService(filters);

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/invoice/", { params: filters });
        expect(result).toBe(mockData.data);
    });

    test("should save a new contract", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const data = { name: "New Contract" };
        const result = await saveNewContractService(data);

        expect(apiDjango.post).toHaveBeenCalledWith("/financial/contract/new", data);
        expect(result).toBe(mockData.data);
    });

    test("should fetch contract details", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const result = await fetchDetailContractService(id);

        expect(apiDjango.get).toHaveBeenCalledWith(`/financial/contract/${id}/`);
        expect(result).toBe(mockData.data);
    });

    test("should fetch contract invoices", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const filters = { status: "unpaid" };
        const result = await fetchDetailContractInvoicesService(id, filters);

        expect(apiDjango.get).toHaveBeenCalledWith(`/financial/contract/${id}/invoices/`, { params: filters });
        expect(result).toBe(mockData.data);
    });

    test("should include a new invoice", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const data = { idContract: 1, amount: 200 };
        const result = await includeNewInvoiceService(data);

        expect(apiDjango.post).toHaveBeenCalledWith(`/financial/contract/${data.idContract}/invoice/`, data);
        expect(result).toBe(mockData.data);
    });

    test("should fetch invoice details", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const result = await fetchDetailInvoiceService(id);

        expect(apiDjango.get).toHaveBeenCalledWith(`/financial/invoice/${id}/`);
        expect(result).toBe(mockData.data);
    });

    test("should fetch invoice payments", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const id = 1;
        const filters = { status: "paid" };
        const result = await fetchDetailInvoicePaymentsService(id, filters);

        expect(apiDjango.get).toHaveBeenCalledWith(`/financial/invoice/${id}/payments/`, { params: filters });
        expect(result).toBe(mockData.data);
    });

    test("should merge contracts", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const data = { id: 1, mergeWithId: 2 };
        const result = await mergeContractService(data);

        expect(apiDjango.post).toHaveBeenCalledWith(`/financial/contract/${data.id}/merge/`, data);
        expect(result).toBe(mockData.data);
    });

    test("should fetch tags", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockData);

        const result = await fetchTagsService();

        expect(apiDjango.get).toHaveBeenCalledWith("/financial/tag/");
        expect(result).toBe(mockData.data);
    });

    test("should include a new tag", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const tag = { name: "New Tag" };
        const result = await includeNewTagService(tag);

        expect(apiDjango.post).toHaveBeenCalledWith("/financial/tag/new", tag);
        expect(result).toBe(mockData.data);
    });

    test("should save invoice tags", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const idInvoice = 1;
        const tags = [1, 2, 3];
        const result = await saveInvoiceTagsService(idInvoice, tags);

        expect(apiDjango.post).toHaveBeenCalledWith(`/financial/invoice/${idInvoice}/tags`, tags);
        expect(result).toBe(mockData);
    });

    test("should update all contracts value", async () => {
        const mockData = { data: "mockData" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockData);

        const result = await updateAllContractsValue();

        expect(apiDjango.post).toHaveBeenCalledWith("/financial/update_all_contracts_value");
        expect(result).toBe(mockData);
    });
});
