"use client";

import { SelectedRowType } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payments/payoff";
import { PaymentsTableProvider } from "@/components/providers/paymentsTable";

import PaymentsTable from "./paymentsTable";

interface PaymentsProps {
    invoice: IInvoicePagination;
    payOffPayment: (id: number) => void;
    selectedRow: SelectedRowType[];
    updateSelectedRows: (keys: SelectedRowType[]) => void;
}

export const Payments = ({ invoice, payOffPayment, updateSelectedRows, selectedRow }: PaymentsProps) => (
    <PaymentsTableProvider>
        <PayoffProvider>
            <PaymentsTable
                invoice={invoice}
                payOffPayment={payOffPayment}
                updateSelectedRows={updateSelectedRows}
                selectedRow={selectedRow}
            />
        </PayoffProvider>
    </PaymentsTableProvider>
);
