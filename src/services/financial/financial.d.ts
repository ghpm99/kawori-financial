interface IContractFilters {
    page: number;
    page_size: number;
    id?: number;
}

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

interface IInvoiceFilters {
    page: number;
    page_size: number;
    status?: number;
    name__icontains?: string;
    installments?: number;
    date__gte?: string;
    date__lte?: string;
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
    idContract: number;
    status: number;
    type: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    active: boolean;
    value: number;
    tags?: number[];
}

interface IMergeContractRequest {
    id: number;
    contracts: number[];
}
