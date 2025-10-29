"use client";
import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payments/payoff";

const FinancialLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <PaymentsProvider>
            <PayoffProvider>{children}</PayoffProvider>
        </PaymentsProvider>
    );
};

export default FinancialLayout;
