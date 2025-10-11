import { Action, combineReducers, configureStore, ThunkAction } from "@reduxjs/toolkit";
import authReducer from "./features/auth";
import classificationReducer from "./features/classification";
import facetextureReducer from "./features/facetexture";
import contractReducer from "./features/financial/contract";
import contractDetailsReducer from "./features/financial/contract/detail";
import invoiceReducer from "./features/financial/invoice";
import invoiceDetailsReducer from "./features/financial/invoice/detail";
import overviewReducer from "./features/financial/overview";
import paymentReducer from "./features/financial/payment";
import paymentDetailsReducer from "./features/financial/payment/detail";
import tagReducer from "./features/financial/tag";
import loadingReducer, { LoadingMiddleware } from "./features/loading";
import configurationReducer from "./features/configuration";
import statusReducer from "./features/status/Index";
import newsFeedReducer from "./features/news";

const financialStore = combineReducers({
    overview: overviewReducer,
    contract: contractReducer,
    contractDetail: contractDetailsReducer,
    invoice: invoiceReducer,
    invoiceDetail: invoiceDetailsReducer,
    payment: paymentReducer,
    paymentDetail: paymentDetailsReducer,
    tag: tagReducer,
});

export const store = () =>
    configureStore({
        reducer: {
            loading: loadingReducer,
            configuration: configurationReducer,
            status: statusReducer,
            auth: authReducer,
            financial: financialStore,
            facetexture: facetextureReducer,
            classification: classificationReducer,
            news: newsFeedReducer,
        },
        devTools: process.env.NODE_ENV === "development",
        middleware: (getDefaultMiddleware) => {
            return getDefaultMiddleware().prepend(LoadingMiddleware.middleware);
        },
    });
export type AppStore = ReturnType<typeof store>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export type AppThunk<ThunkReturnType = void> = ThunkAction<ThunkReturnType, RootState, unknown, Action>;
