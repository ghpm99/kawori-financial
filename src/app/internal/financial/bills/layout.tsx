"use client";

import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payoff";
import { SelectPaymentsProvider } from "@/components/providers/selectPayments";

const BillslLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <SelectPaymentsProvider>
            <PaymentsProvider>
                <PayoffProvider>{children}</PayoffProvider>
            </PaymentsProvider>
        </SelectPaymentsProvider>
    );
};

export default BillslLayout;
