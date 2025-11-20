import { createContext, useCallback, useContext, useReducer, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { message } from "antd";

import {
    fetchAllInvoiceService,
    fetchDetailInvoicePaymentsService,
    fetchDetailInvoiceService,
} from "@/services/financial";

const messageKey = "invoice_pagination_message";

type InvoicesContextValue = {
    invoicesData: InvoicesPage;
    isLoading: boolean;
    invoiceFilters: IInvoiceFilters;
    cleanFilter: () => void;
    handleChangeFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeAllFilters: (filters: IInvoiceFilters) => void;
    updateFiltersBySearchParams: (searchParams: any) => void;
    onChangePagination: (page: number, pageSize: number) => void;
    onOpenInvoiceDetail: (invoiceId?: number) => void;
    onCloseInvoiceDetail: () => void;
    invoiceDetailVisible: boolean;
    invoiceDetail: IInvoiceDetail;
    isLoadingInvoiceDetail: boolean;
    onUpdateInvoiceDetail: (values: IInvoiceDetail) => void;
    invoicePaymentsData: PaymentsPage;
    isLoadInginvoicePaymentsData: boolean;
};

const InvoicesContext = createContext<InvoicesContextValue | undefined>(undefined);

type FilterAction =
    | { type: "SET_ALL"; payload: IInvoiceFilters }
    | { type: "RESET" }
    | { type: "SET_FIELD"; payload: { name: keyof IInvoiceFilters; value: any } }
    | { type: "SET_PAGINATION"; payload: { page: number; page_size: number } };

const defaultFilters: IInvoiceFilters = {
    page: 1,
    page_size: 10,
    status: "open",
};

const invoicesFiltersReducer = (state: IInvoiceFilters, action: FilterAction): IInvoiceFilters => {
    switch (action.type) {
        case "SET_ALL":
            return { ...state, ...action.payload };
        case "RESET":
            return { ...defaultFilters };
        case "SET_FIELD": {
            const { name, value } = action.payload;
            return { ...state, [name]: value } as IInvoiceFilters;
        }
        case "SET_PAGINATION": {
            const { page, page_size } = action.payload;
            return { ...state, page, page_size } as IInvoiceFilters;
        }
        default:
            return state;
    }
};

const defaultInvoicesPage: InvoicesPage = {
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    has_previous: false,
    has_next: false,
    data: [],
};

const defaultInvoiceDetail: IInvoiceDetail = {
    id: 0,
    status: 0,
    name: "",
    date: "",
    installments: 0,
    value: 0,
    value_closed: 0,
    value_open: 0,
    next_payment: "",
    tags: [],
    active: false,
};

export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [localFilters, dispatchFilters] = useReducer(invoicesFiltersReducer, defaultFilters);
    const [invoiceDetailVisible, setInvoiceDetailVisible] = useState<boolean>(false);
    const [invoiceDetailId, setInvoiceDetailId] = useState<number>(undefined);

    const {
        data,
        refetch: refetchPayments,
        isLoading,
    } = useQuery({
        queryKey: ["invoices", localFilters],
        queryFn: async () => {
            const response = await fetchAllInvoiceService(localFilters);
            const data = response.data;
            if (!data) return defaultInvoicesPage;

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
        data: invoiceDetail,
        refetch: refetchInvoiceDetail,
        isLoading: isLoadingInvoiceDetail,
    } = useQuery({
        enabled: !!invoiceDetailId,
        queryKey: ["invoiceDetail", invoiceDetailId],
        queryFn: async () => {
            if (!invoiceDetailId) return defaultInvoiceDetail;
            const response = await fetchDetailInvoiceService(invoiceDetailId);
            const data = response.data;
            if (!data) return defaultInvoiceDetail;
            return response.data;
        },
    });

    const {
        data: invoicePaymentsData,
        refetch: refetchInvoicePaymentsData,
        isLoading: isLoadInginvoicePaymentsData,
    } = useQuery({
        enabled: !!invoiceDetailId,
        queryKey: ["invoicePayments", invoiceDetailId],
        queryFn: async () => {
            if (!invoiceDetailId) return { data: {} } as PaymentsPage;
            const response = await fetchDetailInvoicePaymentsService(invoiceDetailId, { page: 1, page_size: 10 });
            const data = response.data;
            if (!data) return { data: {} } as PaymentsPage;
            return response.data;
        },
    });

    const { mutate: mutateUpdateInvoiceDetail } = useMutation({
        mutationKey: ["updateInvoiceDetail", invoiceDetailId],
        mutationFn: async (data: IInvoiceDetail) => {
            console.log("Updating invoice detail", data);
            return { msg: "Sucesso" };
        },
        onSuccess: ({ msg }) => {
            refetchInvoiceDetail();
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: Error) => {
            message.error({
                content: `Erro ao atualizar nota: ${error.message}`,
                key: messageKey,
            });
        },
    });

    const cleanFilter = useCallback(() => {
        dispatchFilters({ type: "RESET" });
    }, []);

    const handleChangeFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatchFilters({ type: "SET_FIELD", payload: { name: name as keyof IInvoiceFilters, value } });
    }, []);

    const onChangePagination = useCallback((page: number, pageSize: number) => {
        dispatchFilters({ type: "SET_PAGINATION", payload: { page, page_size: pageSize } });
    }, []);

    const handleChangeAllFilters = (filters: IInvoiceFilters) => {
        dispatchFilters({ type: "SET_ALL", payload: filters });
    };

    const updateFiltersBySearchParams = (searchParams: any) => {
        if (!searchParams || Object.keys(searchParams).length === 0) {
            return;
        }
        const filters: IInvoiceFilters = {
            page: searchParams.page,
            page_size: searchParams.page_size,

            date__gte: searchParams.date__gte,
            date__lte: searchParams.date__lte,

            installments: searchParams.installments,
            name__icontains: searchParams.name__icontains,

            status: searchParams.status,
        };
        handleChangeAllFilters(filters);
    };

    const onCloseInvoiceDetail = () => {
        setInvoiceDetailVisible(false);
    };

    const onOpenInvoiceDetail = (invoiceId?: number) => {
        setInvoiceDetailVisible(true);
        setInvoiceDetailId(invoiceId);
    };

    const onUpdateInvoiceDetail = (values: IInvoiceDetail) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        mutateUpdateInvoiceDetail(values);
    };

    return (
        <InvoicesContext.Provider
            value={{
                invoicesData: data ?? defaultInvoicesPage,
                isLoading,
                invoiceFilters: localFilters,
                cleanFilter,
                handleChangeAllFilters,
                handleChangeFilter,
                onChangePagination,
                updateFiltersBySearchParams,
                onOpenInvoiceDetail,
                onCloseInvoiceDetail,
                invoiceDetailVisible,
                invoiceDetail,
                isLoadingInvoiceDetail,
                onUpdateInvoiceDetail,
                invoicePaymentsData,
                isLoadInginvoicePaymentsData,
            }}
        >
            {children}
        </InvoicesContext.Provider>
    );
};

export const useInvoices = (): InvoicesContextValue => {
    const ctx = useContext(InvoicesContext);
    if (!ctx) throw new Error("useInvoices must be used within InvoicesProvider");
    return ctx;
};
