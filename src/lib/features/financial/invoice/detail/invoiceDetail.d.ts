interface IInvoiceDetailStore {
    data: IInvoiceDetail;
    payments: IInvoicePaymentsDetail;
    loading: boolean;
}

interface IInvoiceDetail {
    id: number;
    status: number;
    name: string;
    installments: number;
    value: number;
    value_open: number;
    value_closed: number;
    date: string;
    contract: number;
    contract_name: string;
    tags: ITags[];
}

interface IInvoicePaymentsDetail {
    data: IPaymentPagination[];
    loading: boolean;
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
        totalPages: number;
    };
    filters: IPaymentFilters;
}
