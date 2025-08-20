import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiDjango } from "@/services/index";

export const fetchPaymentReportThunk = createAsyncThunk("financial/fetchPaymentReportThunk", async () => {
    const response = await apiDjango.get("/financial/report/");
    const data = await response.data;
    return data;
});

export const fetchCountPaymentReportThunk = createAsyncThunk("financial/fetchCountPaymentReportThunk", async () => {
    const response = await apiDjango.get("/financial/report/count_payment");
    const data = await response.data;
    return data;
});

export const fetchAmountPaymentReportThunk = createAsyncThunk("financial/fetchAmountPaymentReportThunk", async () => {
    const response = await apiDjango.get("/financial/report/amount_payment");
    const data = await response.data;
    return data;
});

export const fetchAmountPaymentOpenReportThunk = createAsyncThunk(
    "financial/fetchAmountPaymentOpenReportThunk",
    async () => {
        const response = await apiDjango.get("/financial/report/amount_payment_open");
        const data = await response.data;
        return data;
    },
);

export const fetchAmountPaymentClosedReportThunk = createAsyncThunk(
    "financial/fetchAmountPaymentClosedReportThunk",
    async () => {
        const response = await apiDjango.get("/financial/report/amount_payment_closed");
        const data = await response.data;
        return data;
    },
);

export const fetchAmountInvoiceByTagReportThunk = createAsyncThunk(
    "financial/fetchAmountInvoiceByTagReportThunk",
    async () => {
        const response = await apiDjango.get("/financial/report/amount_invoice_by_tag");
        const data = await response.data;
        return data;
    },
);

export const fetchAmountForecastValueThunk = createAsyncThunk("financial/fetchAmountForecastValueThunk", async () => {
    const response = await apiDjango.get("/financial/report/amount_forecast_value");
    const data = await response.data;
    return data;
});
