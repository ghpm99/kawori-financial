interface IContractFilters {
    page: number;
    page_size: number;
    id?: number;
}

interface IPaymentFilters {
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

interface IInvoiceFilters {
    page: number;
    page_size: number;
    status?: string;
    name__icontains?: string;
    installments?: number;
    date__gte?: string;
    date__lte?: string;
    type?: number;
    fixed?: boolean;
}

interface INewPaymentRequest {
    installments: number;
    payment_date: string;
    value: number;
    type: number;
    name: string;
    date: string;
    fixed: boolean;
}

interface ISavePaymentRequest {
    type?: number;
    name?: string;
    payment_date?: string;
    fixed?: boolean;
    active?: boolean;
    value?: number;
}

interface INewContractRequest {
    name: string;
}

interface INewInvoiceRequest {
    status: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    active: boolean;
    value: number;
    tags: number[];
}

interface ISaveInvoiceRequest {
    id: number;
    name: string;
    date: string;
    active: boolean;
    tags: number[];
}
interface IMergeContractRequest {
    id: number;
    contracts: number[];
}
