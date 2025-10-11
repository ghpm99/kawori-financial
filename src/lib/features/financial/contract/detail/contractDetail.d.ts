interface IContractDetailStore {
    data: IContractDetail;
    invoices: IContractInvoicesDetail;
    contracts: IContractPagination[];
    loading: boolean;
    modal: IModalContract;
}

type PayloadChangeVisibleModalContractAction = {
    modal: keyof IModalContract;
    visible: boolean;
};

interface IModalContract {
    mergeContract: {
        id: number[];
        visible: boolean;
        error: boolean;
        errorMsg: string;
    };
    newInvoice: {
        visible: boolean;
        error: boolean;
        errorMsg: string;
    };
}

interface IContractInvoicesDetail {
    data: IInvoice[];
    filters: {
        page: number;
        page_size: number;
    };
    loading: boolean;
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
        totalPages: number;
    };
}

interface ITag {
    id: number;
    name: string;
    color: string;
}

interface IInvoice {
    id: number;
    status: string;
    name: string;
    installments: number;
    value: number;
    value_open: number;
    value_closed: number;
    date: string;
    tags: ITag[];
}
