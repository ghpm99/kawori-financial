import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAllInvoiceService } from "@/services/financial";

const initialState: IInvoiceStore = {
    data: [],
    loading: true,
    modal: {
        newPayment: {
            visible: false,
            error: false,
            errorMsg: "",
        },
    },
    filters: {
        page: 1,
        page_size: 20,
        status: 0,
    },
    pagination: {
        currentPage: 1,
        hasNext: false,
        hasPrevious: false,
        totalPages: 1,
    },
};

export const fetchAllInvoice = createAsyncThunk("financial/fetchAllInvoice", async (filters: IInvoiceFilters) => {
    const response = await fetchAllInvoiceService(filters);
    return {
        response,
    };
});

export const financialSlice = createSlice({
    name: "financial",
    initialState,
    reducers: {
        changeVisibleInvoiceModal: (
            state: IInvoiceStore,
            action: PayloadAction<PayloadChangeVisibleModalInvoiceAction>,
        ) => {
            state.modal[action.payload.modal].visible = action.payload.visible;
        },
        setFilterInvoice: (state: IInvoiceStore, action: PayloadAction<PayloadSetFilterInvoiceAction>) => {
            state.filters = {
                ...state.filters,
                [action.payload.name]: action.payload.value ?? "",
            };
        },
        setFiltersInvoice: (state: IInvoiceStore, action: PayloadAction<IInvoiceFilters>) => {
            state.filters = {
                ...state.filters,
                ...action.payload,
            };
        },
        cleanFilterInvoice: (state: IInvoiceStore) => {
            state.filters = initialState.filters;
        },
        changePagination: (state: IInvoiceStore, action: PayloadAction<PayloadChangePaginationAction>) => {
            state.filters = {
                ...state.filters,
                page: action.payload.page,
                page_size: action.payload.pageSize,
            };
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllInvoice.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAllInvoice.fulfilled, (state, action) => {
                state.data = action.payload.response.data.data;
                state.pagination = {
                    currentPage: action.payload.response.data.current_page,
                    hasNext: action.payload.response.data.has_next,
                    hasPrevious: action.payload.response.data.has_previous,
                    totalPages: action.payload.response.data.total_pages,
                };
                state.loading = false;
            });
    },
});

export const { changeVisibleInvoiceModal, changePagination, cleanFilterInvoice, setFiltersInvoice, setFilterInvoice } =
    financialSlice.actions;

export default financialSlice.reducer;
