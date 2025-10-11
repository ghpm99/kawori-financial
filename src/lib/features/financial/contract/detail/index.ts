import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
    fetchAllContractService,
    fetchDetailContractInvoicesService,
    fetchDetailContractService,
} from "@/services/financial";

const initialState: IContractDetailStore = {
    data: {
        id: 0,
        name: "",
        value: 0,
        value_open: 0,
        value_closed: 0,
    },
    invoices: {
        data: [],
        filters: {
            page: 1,
            page_size: 20,
        },
        loading: true,
        pagination: {
            currentPage: 1,
            hasNext: false,
            hasPrevious: false,
            totalPages: 1,
        },
    },
    contracts: [],
    loading: true,
    modal: {
        mergeContract: {
            id: [],
            visible: false,
            error: false,
            errorMsg: "",
        },
        newInvoice: {
            visible: false,
            error: false,
            errorMsg: "",
        },
    },
};

export const fetchAllContract = createAsyncThunk("financial/fetchAllContract", async (filters: IContractFilters) => {
    const response = await fetchAllContractService(filters);
    return {
        filters,
        response,
    };
});

export const fetchContractDetails = createAsyncThunk("financial/fetchContractDetails", async (id: number) => {
    const response = await fetchDetailContractService(id);
    return response;
});

export const fetchContractInvoicesDetails = createAsyncThunk(
    "financial/fetchContractInvoicesDetails",
    async (args: { id: number; filters: IInvoiceFilters }) => {
        const response = await fetchDetailContractInvoicesService(args.id, args.filters);
        return {
            filters: args.filters,
            response,
        };
    },
);

export const contractDetailSlice = createSlice({
    name: "contractDetail",
    initialState,
    reducers: {
        changeVisibleModalContract: (
            state: IContractDetailStore,
            action: PayloadAction<PayloadChangeVisibleModalContractAction>,
        ) => {
            state.modal[action.payload.modal].visible = action.payload.visible;
        },
        changeValueMergeModal: (state: IContractDetailStore, action: PayloadAction<number[]>) => {
            state.modal.mergeContract.id = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllContract.fulfilled, (state, action) => {
                state.contracts = action.payload.response.data.data;
            })
            .addCase(fetchContractDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchContractDetails.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.loading = false;
            })
            .addCase(fetchContractInvoicesDetails.pending, (state) => {
                state.invoices.loading = true;
            })
            .addCase(fetchContractInvoicesDetails.fulfilled, (state, action) => {
                state.invoices.data = action.payload.response.data.data;
                state.invoices.pagination = {
                    currentPage: action.payload.response.data.current_page,
                    hasNext: action.payload.response.data.has_next,
                    hasPrevious: action.payload.response.data.has_previous,
                    totalPages: action.payload.response.data.total_pages,
                };
                state.invoices.filters = action.payload.filters;
                state.invoices.loading = false;
            })
            .addCase(fetchContractInvoicesDetails.rejected, (state) => {
                state.invoices.loading = false;
            });
    },
});

export const { changeVisibleModalContract, changeValueMergeModal } = contractDetailSlice.actions;

export default contractDetailSlice.reducer;
