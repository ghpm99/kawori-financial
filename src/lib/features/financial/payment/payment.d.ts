interface IPaymentStore {
    data: IPaymentPagination[];
    pagination: {
        currentPage: number;
        hasNext: boolean;
        hasPrevious: boolean;
        totalPages: number;
    };
    loading: boolean;
    filters: IPaymentFilters;
    modal: {
        payoff: {
            visible: boolean;
            data: IPaymentModalPayoffDataSource[];
        };
    };
}

interface IPaymentPagination {
    id: number;
    status: number;
    type: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    value: number;
}

interface IPaymentModalPayoffDataSource {
    status: number;
    id: number;
    description: string;
}

type PayloadChangeStatusPaymentPaginationAction = {
    id: number;
    status: number;
};

type PayloadChangePaginationAction = {
    page: number
    pageSize: number
}

type PayloadSetFilterPaymentsAction = {
    name: string
    value: any
}