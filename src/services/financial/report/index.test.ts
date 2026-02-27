import {
    fetchMonthPayments,
    fetchPaymentReportService,
    fetchCountPaymentReportService,
    fetchAmountPaymentReportService,
    fetchAmountPaymentOpenReportService,
    fetchAmountPaymentClosedReportService,
    fetchAmountInvoiceByTagReportService,
    fetchAmountForecastValueService,
    fetchFinancialMetricsService,
} from ".";
import { apiDjango } from "@/services";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;

describe("reportService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetchMonthPayments chama GET /financial/payment/month/", async () => {
        const mockData = { data: [{ id: 1, name: "Jan", total_value_credit: 100, total_value_debit: 50, total_value_open: 30, total_value_closed: 20, total_payments: 3 }] };
        mockedGet.mockResolvedValueOnce({ data: mockData });

        const result = await fetchMonthPayments();

        expect(mockedGet).toHaveBeenCalledWith("/financial/payment/month/");
        expect(result).toEqual(mockData);
    });

    it("fetchPaymentReportService chama GET /financial/report/ e retorna data.data", async () => {
        const reportData = { payments: [], fixed_debit: 0, fixed_credit: 0 };
        mockedGet.mockResolvedValueOnce({ data: { data: reportData } });

        const result = await fetchPaymentReportService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/");
        expect(result).toEqual(reportData);
    });

    it("fetchCountPaymentReportService chama GET /financial/report/count_payment e retorna data.data", async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: 42 } });

        const result = await fetchCountPaymentReportService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/count_payment");
        expect(result).toBe(42);
    });

    it("fetchAmountPaymentReportService chama GET /financial/report/amount_payment e retorna data.data", async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: 1500.5 } });

        const result = await fetchAmountPaymentReportService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/amount_payment");
        expect(result).toBe(1500.5);
    });

    it("fetchAmountPaymentOpenReportService chama GET /financial/report/amount_payment_open", async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: 300 } });

        const result = await fetchAmountPaymentOpenReportService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/amount_payment_open");
        expect(result).toBe(300);
    });

    it("fetchAmountPaymentClosedReportService chama GET /financial/report/amount_payment_closed", async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: 1200 } });

        const result = await fetchAmountPaymentClosedReportService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/amount_payment_closed");
        expect(result).toBe(1200);
    });

    it("fetchAmountInvoiceByTagReportService chama GET /financial/report/amount_invoice_by_tag e retorna array", async () => {
        const tags = [{ id: 1, name: "Alimentação", color: "#ff0000", amount: 200 }];
        mockedGet.mockResolvedValueOnce({ data: { data: tags } });

        const result = await fetchAmountInvoiceByTagReportService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/amount_invoice_by_tag");
        expect(result).toEqual(tags);
    });

    it("fetchAmountForecastValueService chama GET /financial/report/amount_forecast_value", async () => {
        mockedGet.mockResolvedValueOnce({ data: { data: 750 } });

        const result = await fetchAmountForecastValueService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/amount_forecast_value");
        expect(result).toBe(750);
    });

    it("fetchFinancialMetricsService chama GET /financial/report/metrics/ e retorna data completo", async () => {
        const metrics = {
            revenues: { value: 5000, metric_value: 4800 },
            expenses: { value: 3000, metric_value: 2900 },
            profit: { value: 2000, metric_value: 1900 },
            growth: { value: 5 },
        };
        mockedGet.mockResolvedValueOnce({ data: metrics });

        const result = await fetchFinancialMetricsService();

        expect(mockedGet).toHaveBeenCalledWith("/financial/report/metrics/");
        expect(result).toEqual(metrics);
    });
});
