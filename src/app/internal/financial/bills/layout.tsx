"use client";
import { EarningsProvider } from "@/components/providers/earnings";
import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payments/payoff";

const BillslLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <PaymentsProvider>
            <PayoffProvider>{children}</PayoffProvider>
        </PaymentsProvider>
    );
};

export default BillslLayout;
