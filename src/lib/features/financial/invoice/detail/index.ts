import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchDetailInvoicePaymentsService, fetchDetailInvoiceService } from "@/services/financial";

const initialState: IInvoiceDetailStore = {
    data: {
        id: 0,
        status: 0,
        name: "",
        installments: 0,
        value: 0,
        value_open: 0,
        value_closed: 0,
        date: "",
        contract: 0,
        contract_name: "",
        tags: [],
    },
    payments: {
        data: [],
        pagination: {
            currentPage: 1,
            hasNext: false,
            hasPrevious: false,
            totalPages: 1,
        },
        filters: {
            page: 1,
            page_size: 20,
        },
        loading: true,
    },
    loading: true,
};

export const fetchInvoiceDetails = createAsyncThunk("financial/fetchInvoiceDetails", async (id: number) => {
    const response = await fetchDetailInvoiceService(id);
    return response;
});

export const fetchInvoicePaymentsDetails = createAsyncThunk(
    "financial/",
    async (args: { id: number; filters: IPaymentFilters }) => {
        const response = await fetchDetailInvoicePaymentsService(args.id, args.filters);
        return {
            filters: args.filters,
            response,
        };
    },
);

export const financialSlice = createSlice({
    name: "financial",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInvoiceDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInvoiceDetails.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.loading = false;
            })
            .addCase(fetchInvoicePaymentsDetails.pending, (state) => {
                state.payments.loading = true;
            })
            .addCase(fetchInvoicePaymentsDetails.fulfilled, (state, action) => {
                state.payments.data = action.payload.response.data.data;
                state.payments.pagination = {
                    currentPage: action.payload.response.data.current_page,
                    hasNext: action.payload.response.data.has_next,
                    hasPrevious: action.payload.response.data.has_previous,
                    totalPages: action.payload.response.data.total_pages,
                };
                state.payments.filters = action.payload.filters;
                state.payments.loading = false;
            })
            .addCase(fetchInvoicePaymentsDetails.rejected, (state) => {
                state.payments.loading = false;
            });
    },
});

export default financialSlice.reducer;
