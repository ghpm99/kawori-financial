import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import { fetchAllPaymentService, saveNewPaymentService } from "@/services/financial";
import { apiDjango } from "@/services/index";

const initialState: IPaymentStore = {
    data: [],
    pagination: {
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
        totalPages: 1,
    },
    loading: true,
    filters: {
        page: 1,
        active: true,
        status: "all",
        page_size: 20,
    },
    modal: {
        payoff: {
            data: [],
            visible: false,
        },
    },
};

export const fetchAllPayment = createAsyncThunk("financial/fetchAllPayment", async (filters: IPaymentFilters) => {
    const response = await fetchAllPaymentService(filters);
    return {
        response,
    };
});

export const saveNewPayment = createAsyncThunk(
    "financial/saveNewPayment",
    async (args: { payment: INewPaymentRequest }) => {
        const response = await saveNewPaymentService(args.payment);
        return response;
    },
);

export const fetchMonthPayments = createAsyncThunk("financial/fetchMonthPayments", async () => {
    const response = await apiDjango.get("/financial/payment/month/");
    return response.data;
});

export const financialSlice = createSlice({
    name: "financial",
    initialState,
    reducers: {
        changeStatusPaymentPagination: (
            state: IPaymentStore,
            action: PayloadAction<PayloadChangeStatusPaymentPaginationAction>,
        ) => {
            const index = state.data.findIndex((item) => item.id === action.payload.id);
            state.data[index].status = action.payload.status;
        },
        setFilterPayments: (state: IPaymentStore, action: PayloadAction<PayloadSetFilterPaymentsAction>) => {
            state.filters = {
                ...state.filters,
                [action.payload.name]: action.payload.value ?? "",
            };
        },
        setFiltersPayments: (state: IPaymentStore, action: PayloadAction<IPaymentFilters>) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        cleanFilterPayments: (state: IPaymentStore) => {
            state.filters = initialState.filters;
        },
        changeVisibleModalPayoffPayments: (state: IPaymentStore, action: PayloadAction<boolean>) => {
            state.modal.payoff.visible = action.payload;
        },
        changeDataSourcePayoffPayments: (
            state: IPaymentStore,
            action: PayloadAction<IPaymentModalPayoffDataSource[]>,
        ) => {
            state.modal.payoff.data = action.payload;
        },
        changeSingleDataSourcePayoffPayments: (
            state: IPaymentStore,
            action: PayloadAction<IPaymentModalPayoffDataSource>,
        ) => {
            const index = state.modal.payoff.data.findIndex((item) => item.id === action.payload.id);
            state.modal.payoff.data[index] = action.payload;
        },
        changePagination: (state: IPaymentStore, action: PayloadAction<PayloadChangePaginationAction>) => {
            state.filters = {
                ...state.filters,
                page: action.payload.page,
                page_size: action.payload.pageSize,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllPayment.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllPayment.fulfilled, (state, action) => {
                state.data = action.payload.response.data.data.map((data: any) => ({
                    ...data,
                    key: data.id,
                }));
                state.pagination.currentPage = action.payload.response.data.current_page;
                state.pagination.hasNext = action.payload.response.data.has_next;
                state.pagination.hasPrevious = action.payload.response.data.has_previous;
                state.pagination.totalPages = action.payload.response.data.total_pages;
                state.loading = false;
            })
            .addCase(saveNewPayment.fulfilled, (state, action) => {
                state.data.push(action.payload);
            });
    },
});

export const {
    setFilterPayments,
    cleanFilterPayments,
    changeStatusPaymentPagination,
    changeVisibleModalPayoffPayments,
    changeDataSourcePayoffPayments,
    changeSingleDataSourcePayoffPayments,
    changePagination,
    setFiltersPayments,
} = financialSlice.actions;

export default financialSlice.reducer;
