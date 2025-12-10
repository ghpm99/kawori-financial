"use client";

import { DashboardProvider } from "@/components/providers/dashboard";
import { PayoffProvider } from "@/components/providers/payoff";
import { SelectPaymentsProvider } from "@/components/providers/selectPayments";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => (
    <DashboardProvider>
        <SelectPaymentsProvider>
            <PayoffProvider>{children}</PayoffProvider>
        </SelectPaymentsProvider>
    </DashboardProvider>
);

export default DashboardLayout;
