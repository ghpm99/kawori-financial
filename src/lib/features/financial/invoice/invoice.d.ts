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
    name: string;
    value: any;
};
