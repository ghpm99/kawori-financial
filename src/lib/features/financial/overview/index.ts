import { createSlice } from "@reduxjs/toolkit";

import {
    fetchAmountForecastValueThunk,
    fetchAmountInvoiceByTagReportThunk,
    fetchAmountPaymentClosedReportThunk,
    fetchAmountPaymentOpenReportThunk,
    fetchAmountPaymentReportThunk,
    fetchCountPaymentReportThunk,
    fetchPaymentReportThunk,
} from "@/services/financial/overview";
import { fetchMonthPayments } from "../payment";

const initialState: IOverviewStore = {
    loading: true,
    data: {
        payments: [],
        fixed_credit: 0,
        fixed_debit: 0,
        invoiceByTag: [],
        countPayment: 0,
        amountPayment: 0,
        amountPaymentClosed: 0,
        amountPaymentOpen: 0,
        amountForecastValue: 0,
        month: [],
    },
};

export const financialOverviewSlice = createSlice({
    name: "overview",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPaymentReportThunk.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPaymentReportThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.payments = data.payments;
                state.data.fixed_debit = data.fixed_debit;
                state.data.fixed_credit = data.fixed_credit;
                state.loading = false;
            })
            .addCase(fetchCountPaymentReportThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.countPayment = data;
            })
            .addCase(fetchAmountPaymentReportThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.amountPayment = data;
            })
            .addCase(fetchAmountPaymentOpenReportThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.amountPaymentOpen = data;
            })
            .addCase(fetchAmountPaymentClosedReportThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.amountPaymentClosed = data;
            })
            .addCase(fetchAmountInvoiceByTagReportThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.invoiceByTag = data;
            })
            .addCase(fetchAmountForecastValueThunk.fulfilled, (state, action) => {
                const { data } = action.payload;
                state.data.amountForecastValue = data;
            })
            .addCase(fetchMonthPayments.fulfilled, (state, action) => {
                state.data.month = action.payload.data;
            });
    },
});

export default financialOverviewSlice.reducer;
