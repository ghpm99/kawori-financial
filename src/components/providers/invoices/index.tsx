import { createContext, useCallback, useContext, useEffect, useReducer, useState } from "react";

import { QueryObserverResult, RefetchOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

import {
    fetchAllInvoiceService,
    fetchDetailInvoicePaymentsService,
    fetchDetailInvoiceService,
    includeNewInvoiceService,
    saveInvoiceService,
} from "@/services/financial";
import { usePathname, useRouter } from "next/navigation";
import { updateSearchParams } from "@/util";
import axios, { AxiosError } from "axios";

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
    onCreateNewInvoice: (values: IInvoiceDetail) => void;
    invoicePaymentsData: PaymentsPage;
    isLoadInginvoicePaymentsData: boolean;
    refetchInvoices: (options?: RefetchOptions) => Promise<QueryObserverResult<InvoicesPage, Error>>;
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

export const InvoicesProvider: React.FC<{ children: React.ReactNode; customDefaultFilters?: IInvoiceFilters }> = ({
    children,
    customDefaultFilters = {},
}) => {
    const queryClient = useQueryClient();
    const router = useRouter();
    const pathname = usePathname();
    const [isInitialized, setIsInitialized] = useState(false);
    const [localFilters, dispatchFilters] = useReducer(invoicesFiltersReducer, {
        ...defaultFilters,
        ...customDefaultFilters,
    });
    const [invoiceDetailVisible, setInvoiceDetailVisible] = useState<boolean>(false);
    const [invoiceDetailId, setInvoiceDetailId] = useState<number>(undefined);

    const {
        data,
        refetch: refetchInvoices,
        isLoading,
    } = useQuery({
        enabled: isInitialized,
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

    const { data: invoicePaymentsData, isLoading: isLoadInginvoicePaymentsData } = useQuery({
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
            const response = await saveInvoiceService({
                ...data,
                tags: data.tags.map((tag) => tag.id),
            });
            return response.msg;
        },
        onSuccess: (msg) => {
            queryClient.invalidateQueries({ queryKey: ["invoiceDetail"] });
            refetchInvoices();
            onCloseInvoiceDetail();
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error) => {
            let msgError = `Erro ao atualizar nota: ${error.message}`;
            if (axios.isAxiosError(error)) {
                msgError = ((error as AxiosError).response.data as CommonApiResponse).msg ?? "Erro ao atualizar nota";
            }
            message.error({
                content: msgError,
                key: messageKey,
            });
        },
    });

    const { mutate: mutateCreateNewInvoice } = useMutation({
        mutationKey: ["createNewInvoice"],
        mutationFn: async (data: IInvoiceDetail) => {
            const response = await includeNewInvoiceService({
                ...data,
                payment_date: data.next_payment,
                fixed: false,
                tags: data.tags.map((tag) => tag.id),
            });

            return response.msg;
        },
        onSuccess: (msg) => {
            refetchInvoices();
            onCloseInvoiceDetail();
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: Error) => {
            let msgError = `Erro ao criar nota: ${error.message}`;
            if (axios.isAxiosError(error)) {
                msgError = ((error as AxiosError).response.data as CommonApiResponse).msg ?? "Erro ao criar nota";
            }
            message.error({
                content: msgError,
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

    useEffect(() => {
        if (!isInitialized) return;
        updateSearchParams(router, pathname, localFilters);
    }, [isInitialized, localFilters, router, pathname]);

    const updateFiltersBySearchParams = (searchParams) => {
        if (!searchParams || Object.keys(searchParams).length === 0) {
            setIsInitialized(true);
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
        setIsInitialized(true);
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

    const onCreateNewInvoice = (values: IInvoiceDetail) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        mutateCreateNewInvoice(values);
    };

    return (
        <InvoicesContext.Provider
            value={{
                invoicesData: data ?? defaultInvoicesPage,
                refetchInvoices,
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
                onCreateNewInvoice,
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
