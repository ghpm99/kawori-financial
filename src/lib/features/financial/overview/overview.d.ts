interface IOverviewStore {
    loading: boolean;
    data: {
        payments: IPaymentCharts[];
        fixed_debit: number;
        fixed_credit: number;
        invoiceByTag: IInvoiceByTag[];
        countPayment: number;
        amountPayment: number;
        amountPaymentOpen: number;
        amountPaymentClosed: number;
        amountForecastValue: number;
        month: IPaymentMonth[];
    };
}

interface IPaymentCharts {
    label: string;
    debit: number;
    credit: number;
    total: number;
    difference: number;
    accumulated: number;
}

interface IInvoiceByTag {
    id: number;
    name: string;
    color: string;
    amount: number;
}

interface IPaymentMonth {
    id: number;
    name: string;
    total_value_credit: number;
    total_value_debit: number;
    total_value_open: number;
    total_value_closed: number;
    total_payments: number;
}
