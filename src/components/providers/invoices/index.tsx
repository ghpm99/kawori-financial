import { createContext, useCallback, useContext, useReducer } from "react";

import { useQuery } from "@tanstack/react-query";

import { fetchAllInvoiceService } from "@/services/financial";

type InvoicesContextValue = {
    invoicesData: InvoicesPage;
    isLoading: boolean;
    invoiceFilters: IInvoiceFilters;
    cleanFilter: () => void;
    handleChangeFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeAllFilters: (filters: IInvoiceFilters) => void;
    updateFiltersBySearchParams: (searchParams: any) => void;
    onChangePagination: (page: number, pageSize: number) => void;
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

export const InvoicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [localFilters, dispatchFilters] = useReducer(invoicesFiltersReducer, defaultFilters);

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
