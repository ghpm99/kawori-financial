"use client";

import React, { createContext, useCallback, useContext, useReducer, useState } from "react";

import { QueryObserverResult, RefetchOptions, useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import dayjs from "dayjs";

import {
    fetchAllPaymentService,
    fetchDetailPaymentService,
    savePaymentDetailService,
} from "@/services/financial/payments";
import { getStringValue } from "@/util";
import { AxiosError } from "axios";
import { ITags } from "../tags";

export interface IPaymentPagination {
    id: number;
    status: number;
    type: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    value: number;
}
export interface IPaymentDetail {
    id: number;
    status: number;
    type: number;
    name: string;
    description: string;
    reference: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    active: boolean;
    value: number;
    invoice: number;
    invoice_name: string;
}

export interface IPaymentFilters {
    page: number;
    page_size: number;
    status?: "all" | "open" | "done";
    type?: number;
    name__icontains?: string;
    date__gte?: string;
    date__lte?: string;
    installments?: number;
    payment_date__gte?: string;
    payment_date__lte?: string;
    fixed?: boolean;
    active?: boolean;
    invoice?: string;
    invoice_id?: number;
}
export interface PaymentItem {
    id: number;
    status: number;
    type: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    value: number;
    invoice_id: number;
    invoice_name: string;
    tags: ITags[];
}

export interface PaymentsPage {
    current_page: number;
    total_pages: number;
    page_size: number;
    has_previous: boolean;
    has_next: boolean;
    data: PaymentItem[];
}

type PaymentsContextValue = {
    paymentFilters: IPaymentFilters;
    paymentsData: PaymentsPage;
    refetchPayments: (options?: RefetchOptions) => Promise<QueryObserverResult<PaymentsPage, Error>>;
    isLoading: boolean;
    cleanFilter: () => void;
    handleChangeFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateRangedFilter: (name: string, dates: string[]) => void;
    handleSelectFilter: (name: keyof IPaymentFilters, value: string | number) => void;
    handleChangeAllFilters: (filters: IPaymentFilters) => void;
    updateFiltersBySearchParams: (searchParams: { [key: string]: string | string[] | undefined }) => void;
    onChangePagination: (page: number, pageSize: number) => void;
    paymentDetailVisible: boolean;
    onClosePaymentDetail: () => void;
    onOpenPaymentDetail: (paymentId?: number) => void;
    isLoadingPaymentDetail: boolean;
    paymentDetail: IPaymentDetail;
    onUpdatePaymentDetail: (values: IPaymentDetail) => void;
};

const PaymentsContext = createContext<PaymentsContextValue | undefined>(undefined);

type FilterAction =
    | { type: "SET_ALL"; payload: IPaymentFilters }
    | { type: "RESET" }
    | { type: "SET_FIELD"; payload: { name: keyof IPaymentFilters; value: string | number | null } }
    | { type: "SET_PAGINATION"; payload: { page: number; page_size: number } };

const defaultFilters: IPaymentFilters = {
    page: 1,
    page_size: 10,
    active: true,
    status: "open",
};

const paymentFiltersReducer = (state: IPaymentFilters, action: FilterAction): IPaymentFilters => {
    switch (action.type) {
        case "SET_ALL":
            return { ...state, ...action.payload };
        case "RESET":
            return { ...defaultFilters };
        case "SET_FIELD": {
            const { name, value } = action.payload;
            return { ...state, [name]: value } as IPaymentFilters;
        }
        case "SET_PAGINATION": {
            const { page, page_size } = action.payload;
            return { ...state, page, page_size } as IPaymentFilters;
        }
        default:
            return state;
    }
};

const messageKey = "payment_pagination_message";

const defaultPaymentDetail: IPaymentDetail = {
    id: 0,
    status: 0,
    type: 0,
    name: "",
    date: "",
    installments: 0,
    payment_date: "",
    fixed: false,
    value: 0,
    active: false,
    invoice: 0,
    invoice_name: "",
    description: "",
    reference: "",
};

const defaultPaymentsPage: PaymentsPage = {
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    has_previous: false,
    has_next: false,
    data: [],
};

export const PaymentsProvider: React.FC<{ children: React.ReactNode; customDefaultFilters?: IPaymentFilters }> = ({
    children,
    customDefaultFilters = {},
}) => {
    const initFilters = (): IPaymentFilters => {
        return {
            ...defaultFilters,
            ...customDefaultFilters,
        };
    };

    const [localFilters, dispatchFilters] = useReducer(paymentFiltersReducer, undefined, initFilters);
    const [paymentDetailVisible, setPaymentDetailVisible] = useState<boolean>(false);
    const [paymentDetailId, setPaymentDetailId] = useState<number | undefined>(undefined);

    const {
        data,
        refetch: refetchPayments,
        isLoading,
    } = useQuery({
        queryKey: ["payments", localFilters],
        queryFn: async () => {
            const response = await fetchAllPaymentService(localFilters);
            const data = response.data;
            if (!data) return defaultPaymentsPage;

            return {
                ...data,
                data: data.data.map((item) => ({
                    ...item,
                    key: item.id,
                })),
            };
        },
    });

    const {
        data: paymentDetail,
        refetch: refetchPaymentDetail,
        isLoading: isLoadingPaymentDetail,
    } = useQuery({
        queryKey: ["paymentDetail", paymentDetailId],
        queryFn: async () => {
            if (!paymentDetailId) return defaultPaymentDetail;
            const response = await fetchDetailPaymentService(paymentDetailId);
            const data = response.data;
            if (!data) return defaultPaymentDetail;
            return response.data;
        },
    });

    const { mutate: mutateUpdatePaymentDetail } = useMutation({
        mutationKey: ["updatePaymentDetail", paymentDetailId],
        mutationFn: async (data: IPaymentDetail) => {
            const response = await savePaymentDetailService(paymentDetailId!, {
                type: data.type,
                active: data.active,
                name: data.name,
                payment_date: data.payment_date,
                fixed: data.fixed,
                value: data.value,
            });
            return response;
        },
        onSuccess: ({ msg }) => {
            refetchPaymentDetail();
            refetchPayments();
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: AxiosError) => {
            message.error({
                content: (error?.response?.data as CommonApiResponse).msg ?? "Erro ao atualizar pagamento",
                key: messageKey,
            });
        },
    });

    const cleanFilter = useCallback(() => {
        dispatchFilters({ type: "RESET" });
    }, []);

    const handleChangeFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatchFilters({ type: "SET_FIELD", payload: { name: name as keyof IPaymentFilters, value } });
    }, []);

    const handleDateRangedFilter = (name: string, dates: string[]) => {
        const dateGte = dates[0] ? dayjs(dates[0], "DD/MM/YYYY").format("YYYY-MM-DD") : null;
        const dateLte = dates[1] ? dayjs(dates[1], "DD/MM/YYYY").format("YYYY-MM-DD") : null;

        dispatchFilters({
            type: "SET_FIELD",
            payload: { name: `${name}__gte` as keyof IPaymentFilters, value: dateGte },
        });
        dispatchFilters({
            type: "SET_FIELD",
            payload: { name: `${name}__lte` as keyof IPaymentFilters, value: dateLte },
        });
    };

    const handleSelectFilter = (name: keyof IPaymentFilters, value: string | number) => {
        dispatchFilters({ type: "SET_FIELD", payload: { name: name, value } });
    };

    const onChangePagination = useCallback((page: number, pageSize: number) => {
        dispatchFilters({ type: "SET_PAGINATION", payload: { page, page_size: pageSize } });
    }, []);

    const handleChangeAllFilters = (filters: IPaymentFilters) => {
        dispatchFilters({ type: "SET_ALL", payload: filters });
    };

    const updateFiltersBySearchParams = (searchParams: { [key: string]: string | string[] | undefined }) => {
        if (!searchParams || Object.keys(searchParams).length === 0) {
            return;
        }

        const filters: IPaymentFilters = {
            page: Number(getStringValue(searchParams.page)) || 1,
            page_size: Number(getStringValue(searchParams.page_size)) || 10,
            active: getStringValue(searchParams.active) === "true",
            invoice: getStringValue(searchParams.invoice),
            date__gte: getStringValue(searchParams.date__gte),
            date__lte: getStringValue(searchParams.date__lte),
            fixed: getStringValue(searchParams.fixed) === "true",
            installments: Number(getStringValue(searchParams.installments)) || undefined,
            name__icontains: getStringValue(searchParams.name__icontains),
            payment_date__gte: getStringValue(searchParams.payment_date__gte),
            payment_date__lte: getStringValue(searchParams.payment_date__lte),
            status: getStringValue(searchParams.status) as "all" | "open" | "done" | undefined,
            type: Number(getStringValue(searchParams.type)) || undefined,
        };

        const cleanedFilters = {
            ...defaultFilters,
            ...(Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== undefined),
            ) as Partial<IPaymentFilters>),
        };

        handleChangeAllFilters(cleanedFilters);
    };

    const onClosePaymentDetail = () => {
        setPaymentDetailVisible(false);
        setPaymentDetailId(undefined);
    };

    const onOpenPaymentDetail = (paymentId?: number) => {
        setPaymentDetailVisible(true);
        setPaymentDetailId(paymentId);
    };

    const onUpdatePaymentDetail = (values: IPaymentDetail) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        mutateUpdatePaymentDetail(values);
    };

    return (
        <PaymentsContext.Provider
            value={{
                paymentFilters: localFilters,
                isLoading: isLoading,
                cleanFilter,
                handleChangeFilter,
                handleDateRangedFilter,
                handleSelectFilter,
                updateFiltersBySearchParams,
                onChangePagination,
                paymentsData: data ?? defaultPaymentsPage,
                refetchPayments,
                paymentDetailVisible,
                onClosePaymentDetail,
                onOpenPaymentDetail,
                isLoadingPaymentDetail,
                paymentDetail,
                onUpdatePaymentDetail,
                handleChangeAllFilters,
            }}
        >
            {children}
        </PaymentsContext.Provider>
    );
};

export const usePayments = (): PaymentsContextValue => {
    const ctx = useContext(PaymentsContext);
    if (!ctx) throw new Error("usePayments must be used within PaymentsProvider");
    return ctx;
};
