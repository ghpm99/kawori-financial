"use client";

import { BudgetProvider } from "@/components/providers/budget";

const BudgetlLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <BudgetProvider
            initial={[
                { id: 1, name: "Custos fixos", amount: 40, active: true, color: "#1f77b4" },
                { id: 2, name: "Conforto", amount: 20, active: true, color: "#ff7f0e" },
                { id: 3, name: "Metas", amount: 5, active: true, color: "#2ca02c" },
                { id: 4, name: "Prazeres", amount: 5, active: true, color: "#d62728" },
                { id: 5, name: "Liberdade financeira", amount: 25, active: true, color: "#9467bd" },
                { id: 6, name: "Conhecimento", amount: 5, active: true, color: "#8c564b" },
            ]}
        >
            {children}
        </BudgetProvider>
    );
};

export default BudgetlLayout;
