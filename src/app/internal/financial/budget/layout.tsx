"use client";

import { BudgetProvider } from "@/components/providers/budget";

const BudgetlLayout = ({ children }: { children: React.ReactNode }) => {
    return <BudgetProvider>{children}</BudgetProvider>;
};

export default BudgetlLayout;
