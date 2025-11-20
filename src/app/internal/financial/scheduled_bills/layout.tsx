"use client";
import { PaymentsProvider } from "@/components/providers/payments";
import { PayoffProvider } from "@/components/providers/payoff";

const ScheduledBillslLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <PaymentsProvider>
            <PayoffProvider>{children}</PayoffProvider>
        </PaymentsProvider>
    );
};

export default ScheduledBillslLayout;
