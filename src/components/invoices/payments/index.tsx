"use client";

import PaymentsTable from "@/components/payments/paymentsTable";
import { SelectedRowType, usePayments } from "@/components/providers/payments";
import { usePayoff } from "@/components/providers/payments/payoff";

import { useEffect } from "react";

interface PaymentsProps {
    invoice: IInvoicePagination;
    payOffPayment: (id: number) => void;
    selectedRow: SelectedRowType[];
    updateSelectedRows: (keys: SelectedRowType[]) => void;
}

export const Payments = ({ invoice, updateSelectedRows, selectedRow }: PaymentsProps) => {
    const {
        paymentsData,
        isLoading,
        paymentFilters,
        onChangePagination,
        handleChangeFilter,
        handleDateRangedFilter,
        handleSelectFilter,
        onOpenPaymentDetail,
    } = usePayments();

    const { payOffPayment } = usePayoff();

    useEffect(() => {
        if (invoice) {
            handleSelectFilter("invoice_id", invoice.id);
        }
    }, []);

    return (
        <PaymentsTable
            handleChangeFilter={handleChangeFilter}
            handleDateRangedFilter={handleDateRangedFilter}
            handleSelectFilter={handleSelectFilter}
            isLoading={isLoading}
            onChangePagination={onChangePagination}
            onOpenPaymentDetail={onOpenPaymentDetail}
            payOffPayment={payOffPayment}
            paymentFilters={paymentFilters}
            paymentsData={paymentsData}
            selectedRow={selectedRow}
            updateSelectedRows={updateSelectedRows}
        />
    );
};
