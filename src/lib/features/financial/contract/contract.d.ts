interface IContractStore {
    data: IContractPagination[];
    loading: boolean;
    modal: IModalContracts;
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
        totalPages: number;
    };
    filters: IContractFilters;
}

interface IModalContracts {
    newPayment: {
        visible: boolean;
        error: boolean;
        errorMsg: string;
    };
}

type PayloadChangeVisibleModalContractsAction = {
    modal: keyof IModalContracts;
    visible: boolean;
};

interface IContractPagination {
    id: number;
    name: string;
    value: number;
    value_open: number;
    value_closed: number;
}

type PayloadSetFilterContractsAction = {
    name: string;
    value: any;
};
