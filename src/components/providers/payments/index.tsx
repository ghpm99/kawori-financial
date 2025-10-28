"use client";

import {
    fetchAllPaymentService,
    fetchDetailPaymentService,
    payoffPaymentService,
    savePaymentDetailService,
} from "@/services/financial";
import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";
import dayjs from "dayjs";
import React, { createContext, useCallback, useContext, useState } from "react";

interface IPaymentFilters {
    page: number;
    page_size: number;
    status?: number;
    type?: number;
    name__icontains?: string;
    date__gte?: string;
    date__lte?: string;
    installments?: number;
    payment_date__gte?: string;
    payment_date__lte?: string;
    fixed?: boolean;
    active?: boolean;
    contract?: string;
}

type PaymentsContextValue = {
    paymentFilters: IPaymentFilters;
    paymentsData: PaymentsPage;
    isLoading: boolean;
    selectedRow: React.Key[];
    setSelectedRow: (keys: React.Key[]) => void;
    cleanFilter: () => void;
    handleChangeFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateRangedFilter: (name: string, dates: string[]) => void;
    handleSelectFilter: (name: keyof IPaymentFilters, value: string | number) => void;
    onChangePagination: (page: number, pageSize: number) => void;
    paymentDetailVisible: boolean;
    onClosePaymentDetail: () => void;
    onOpenPaymentDetail: (paymentId?: number) => void;
    isLoadingPaymentDetail: boolean;
    paymentDetail: IPaymentDetail | null;
    onUpdatePaymentDetail: (values: IPaymentDetail) => void;
    payOffPayment: (id: number) => void;
};

const PaymentsContext = createContext<PaymentsContextValue | undefined>(undefined);

type FilterAction =
    | { type: "SET_ALL"; payload: IPaymentFilters }
    | { type: "RESET" }
    | { type: "SET_FIELD"; payload: { name: keyof IPaymentFilters; value: any } }
    | { type: "SET_PAGINATION"; payload: { page: number; page_size: number } };

const defaultFilters: IPaymentFilters = {
    page: 1,
    page_size: 10,
    active: true,
    status: 0,
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
    contract: 0,
    active: false,
    contract_name: "",
    invoice: 0,
    invoice_name: "",
};

const defaultPaymentsPage: PaymentsPage = {
    current_page: 1,
    total_pages: 1,
    has_previous: false,
    has_next: false,
    data: [],
};

export const PaymentsProvider: React.FC<{ children: React.ReactNode; searchParams?: Record<string, any> }> = ({
    children,
    searchParams,
}) => {
    const initFilters = (): IPaymentFilters => {
        return {
            ...defaultFilters,
            ...(searchParams ?? {}),
        };
    };

    const [selectedRow, setSelectedRow] = useState<React.Key[]>([]);
    const [localFilters, dispatchFilters] = React.useReducer(paymentFiltersReducer, undefined, initFilters);
    const [paymentDetailVisible, setPaymentDetailVisible] = useState<boolean>(false);
    const [paymentDetailId, setPaymentDetailId] = useState<number>(undefined);

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
            const response = await savePaymentDetailService(paymentDetailId, {
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
        onError: (error: Error) => {
            message.error({
                content: `Erro ao atualizar pagamento: ${error.message}`,
                key: messageKey,
            });
        },
    });

    const { mutate: mutatePayoffPayment } = useMutation({
        mutationKey: ["payoffPayment"],
        mutationFn: async (id: number) => {
            const response = await payoffPaymentService(id);
            return response;
        },
        onSuccess: ({ msg }, id: number) => {
            message.success({
                content: msg,
                key: messageKey,
            });
            refetchPayments();
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

    const onClosePaymentDetail = () => {
        setPaymentDetailVisible(false);
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

    const payOffPayment = (id: number) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        mutatePayoffPayment(id);
    };

    const processPayOffMassive = () => {};

    return (
        <PaymentsContext.Provider
            value={{
                paymentFilters: localFilters,
                selectedRow,
                setSelectedRow,
                isLoading: isLoading,
                cleanFilter,
                handleChangeFilter,
                handleDateRangedFilter,
                handleSelectFilter,
                onChangePagination,
                paymentsData: data ?? defaultPaymentsPage,
                paymentDetailVisible,
                onClosePaymentDetail,
                onOpenPaymentDetail,
                isLoadingPaymentDetail,
                paymentDetail,
                onUpdatePaymentDetail,
                payOffPayment,
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
