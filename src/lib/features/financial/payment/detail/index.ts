import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchDetailPaymentService } from "@/services/financial";

const initialState: IPaymentDetailStore = {
    data: {
        id: 0,
        status: 0,
        type: 0,
        name: "",
        date: "",
        installments: 0,
        payment_date: "",
        fixed: false,
        active: false,
        value: 0,
        invoice: 0,
        invoice_name: "",
        contract: 0,
        contract_name: "",
    },
    loading: true,
};

export const fetchPaymentDetails = createAsyncThunk("financial/fetchPaymentDetails", async (id: number) => {
    const response = await fetchDetailPaymentService(id);
    return response;
});

export const financialSlice = createSlice({
    name: "financial",
    initialState,
    reducers: {
        changeStatusPaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<number>) => {
            state.data.status = action.payload;
        },
        changeNamePaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<string>) => {
            state.data.name = action.payload;
        },
        changeTypePaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<number>) => {
            state.data.type = action.payload;
        },
        changeFixedPaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<boolean>) => {
            state.data.fixed = action.payload;
        },
        changeActivePaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<boolean>) => {
            state.data.active = action.payload;
        },
        changePaymentDatePaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<string>) => {
            state.data.payment_date = action.payload;
        },
        changeValuePaymentDetails: (state: IPaymentDetailStore, action: PayloadAction<number>) => {
            state.data.value = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder

            .addCase(fetchPaymentDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchPaymentDetails.fulfilled, (state, action) => {
                state.data = action.payload.data;
                state.loading = false;
            });
    },
});

export const {
    changeStatusPaymentDetails,
    changeNamePaymentDetails,
    changeTypePaymentDetails,
    changeFixedPaymentDetails,
    changeActivePaymentDetails,
    changePaymentDatePaymentDetails,
    changeValuePaymentDetails,
} = financialSlice.actions;

export default financialSlice.reducer;
