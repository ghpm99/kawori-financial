"use client";
import { InvoicesProvider } from "@/components/providers/invoices";
import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payments/payoff";

const InvoiceslLayout = ({ children }: { children: React.ReactNode }) => (
    <InvoicesProvider>
        <PaymentsProvider>
            <PayoffProvider>{children}</PayoffProvider>
        </PaymentsProvider>
    </InvoicesProvider>
);

export default InvoiceslLayout;
