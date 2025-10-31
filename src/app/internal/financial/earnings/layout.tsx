"use client";

import { EarningsProvider } from "@/components/providers/earnings";
import { PayoffProvider } from "@/components/providers/payments/payoff";

const EarningsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <EarningsProvider>
            <PayoffProvider>{children}</PayoffProvider>
        </EarningsProvider>
    );
};

export default EarningsLayout;
