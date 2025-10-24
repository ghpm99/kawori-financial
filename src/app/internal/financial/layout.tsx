"use client";
import { PaymentsProvider } from "@/components/providers/payments";

const FinancialLayout = ({ children }: { children: React.ReactNode }) => {
    return <PaymentsProvider>{children}</PaymentsProvider>;
};

export default FinancialLayout;
