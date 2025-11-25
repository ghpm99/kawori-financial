"use client";

import { useEffect } from "react";

import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import PaymentsTable from "@/components/payments/paymentsTable";
import { PaymentsProvider, usePayments } from "@/components/providers/payments";
import { usePayoff } from "@/components/providers/payoff";
import { useSelectPayments } from "@/components/providers/selectPayments";

interface PaymentsProps {
    invoice: IInvoicePagination;
}

const Payments = ({ invoice }: PaymentsProps) => {
    const {
        paymentsData,
        isLoading,
        paymentFilters,
        onChangePagination,
        handleChangeFilter,
        handleDateRangedFilter,
        handleSelectFilter,
        onOpenPaymentDetail,
        onClosePaymentDetail,
        paymentDetailVisible,
        paymentDetail,
        isLoadingPaymentDetail,
        onUpdatePaymentDetail,
    } = usePayments();

    const { selectedRow, updateSelectedRows } = useSelectPayments();

    const { payOffPayment } = usePayoff();

    useEffect(() => {
        if (invoice) {
            handleSelectFilter("invoice_id", invoice.id);
        }
    }, [invoice]);

    return (
        <>
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
            <PaymentsDrawer
                onClose={onClosePaymentDetail}
                open={paymentDetailVisible}
                paymentDetail={paymentDetail}
                isLoading={isLoadingPaymentDetail}
                onUpdatePaymentDetail={onUpdatePaymentDetail}
            />
        </>
    );
};

export const InvoicePayments = ({ invoice }: PaymentsProps) => {
    return (
        <PaymentsProvider>
            <Payments invoice={invoice} />
        </PaymentsProvider>
    );
};
