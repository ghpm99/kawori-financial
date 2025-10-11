interface IInvoiceStore {
    data: IInvoicePagination[];
    loading: boolean;
    modal: IModalInvoice;
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
        totalPages: number;
    };
    filters: IInvoiceFilters;
}

interface IInvoicePagination {
    id: number;
    status: number;
    name: string;
    installments: number;
    value: number;
    value_open: number;
    value_closed: number;
    date: string;
    contract: number;
    tags: ITags[];
}

interface IModalInvoice {
    newPayment: {
        visible: boolean;
        error: boolean;
        errorMsg: string;
    };
}

type PayloadChangeVisibleModalInvoiceAction = {
    modal: keyof IModalInvoice;
    visible: boolean;
};

type PayloadSetFilterInvoiceAction = {
    name: string
    value: any
}
