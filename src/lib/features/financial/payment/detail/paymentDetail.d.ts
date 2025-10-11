interface IPaymentDetailStore {
    data: IPaymentDetail;
    loading: boolean;
}

interface IPaymentDetail {
    id: number;
    status: number;
    type: number;
    name: string;
    date: string;
    installments: number;
    payment_date: string;
    fixed: boolean;
    active: boolean;
    value: number;
    invoice: number;
    invoice_name: string;
    contract: number;
    contract_name: string;
}
