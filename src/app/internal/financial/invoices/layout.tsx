"use client";
import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payments/payoff";

const InvoiceslLayout = ({ children }: { children: React.ReactNode }) => (
    <PaymentsProvider>
        <PayoffProvider>{children}</PayoffProvider>
    </PaymentsProvider>
);

export default InvoiceslLayout;
