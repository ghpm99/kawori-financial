"use client";

import { EarningsProvider } from "@/components/providers/earnings";
import { PayoffProvider } from "@/components/providers/payoff";
import { SelectPaymentsProvider } from "@/components/providers/selectPayments";

const EarningsLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SelectPaymentsProvider>
            <EarningsProvider>
                <PayoffProvider>{children}</PayoffProvider>
            </EarningsProvider>
        </SelectPaymentsProvider>
    );
};

export default EarningsLayout;
