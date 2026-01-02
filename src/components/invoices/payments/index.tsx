"use client";

import { useEffect } from "react";

import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import PaymentsTable from "@/components/payments/paymentsTable";
import { IPaymentFilters, PaymentsProvider, usePayments } from "@/components/providers/payments";
import { usePayoff } from "@/components/providers/payoff";
import { useSelectPayments } from "@/components/providers/selectPayments";
import { IInvoicePagination } from "@/components/providers/invoices";

interface PaymentsProps extends IPaymentFilters {
    invoiceData: IInvoicePagination;
}

const Payments = (invoiceData: PaymentsProps["invoiceData"]) => {
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
        if (invoiceData) {
            handleSelectFilter("invoice_id", invoiceData.id);
        }
    }, [handleSelectFilter, invoiceData]);

    return (
        <>
            <PaymentsTable
                simplifiedView
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

export const InvoicePayments = ({ invoiceData, ...filters }: PaymentsProps) => {
    return (
        <PaymentsProvider customDefaultFilters={filters}>
            <Payments {...invoiceData} />
        </PaymentsProvider>
    );
};
