"use client";

import { fetchAllPaymentService } from "@/services/financial";
import { useQuery } from "@tanstack/react-query";
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
    selectedRowKeys: React.Key[];
    setSelectedRowKeys: (keys: React.Key[]) => void;
    cleanFilter: () => void;
    handleChangeFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onChangePagination: (page: number, pageSize: number) => void;
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
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [localFilters, dispatchFilters] = React.useReducer(paymentFiltersReducer, undefined, initFilters);

    const { data, refetch } = useQuery({
        queryKey: ["payments", localFilters],
        queryFn: async () => {
            const response = await fetchAllPaymentService(localFilters);
            return response.data;
        },
    });

    console.log("Payments fetched data:", data);
    const cleanFilter = useCallback(() => {
        dispatchFilters({ type: "RESET" });
    }, []);

    const handleChangeFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatchFilters({ type: "SET_FIELD", payload: { name: name as keyof IPaymentFilters, value } });
    }, []);

    const onChangePagination = useCallback((page: number, pageSize: number) => {
        dispatchFilters({ type: "SET_PAGINATION", payload: { page, page_size: pageSize } });
    }, []);

    return (
        <PaymentsContext.Provider
            value={{
                paymentFilters: localFilters,
                selectedRowKeys,
                setSelectedRowKeys,
                cleanFilter,
                handleChangeFilter,
                onChangePagination,
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
