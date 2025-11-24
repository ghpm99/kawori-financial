interface IInvoicePagination {
    id: number;
    status: number;
    name: string;
    installments: number;
    value: number;
    value_open: number;
    value_closed: number;
    date: string;
    next_payment: string;
    tags: ITags[];
}

interface InvoicesPage {
    current_page: number;
    total_pages: number;
    page_size: number;
    has_previous: boolean;
    has_next: boolean;
    data: IInvoicePagination[];
}

interface InvoicesApiResponse {
    data: InvoicesPage;
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
    next_payment: string;
    tags: ITags[];
    active: boolean;
}
