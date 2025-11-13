import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { AlertProps } from "antd";

export interface IBudget {
    id: number;
    name: string;
    amount: number; // valor em float (ex: 350.5)
    color?: string;
    active?: boolean;
}

type FeedbackMessageType = { msg: string; type: AlertProps["type"] };

type BudgetContextValue = {
    budgets: IBudget[];
    selectedBudget?: IBudget;
    loading: boolean;
    totalAmount: number;
    setBudgets: (items: IBudget[]) => void;
    addBudget: (b: IBudget) => void;
    updateBudget: (id: number, patch: Partial<IBudget>) => void;
    removeBudget: (id: number) => void;
    selectBudget: (id?: number) => void;
    clearSelection: () => void;
    updateBudgetAmount: (id: number, amount: number) => void;
    feedbackMessage: FeedbackMessageType;
    enabledSave: boolean;
};

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode; initial?: IBudget[] }> = ({
    children,
    initial = [],
}) => {
    const [budgets, setBudgetsState] = useState<IBudget[]>(initial);
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [enabledSave, setEnabledSave] = useState(false);
    const [feedbackMessage, setfeedbackMessage] = useState<FeedbackMessageType>({
        msg: "",
        type: "info",
    });

    const setBudgets = useCallback((items: IBudget[]) => {
        setBudgetsState(items);
    }, []);

    const addBudget = useCallback((b: IBudget) => {
        setBudgetsState((prev) => [...prev, b]);
    }, []);

    const updateBudget = useCallback((id: number, patch: Partial<IBudget>) => {
        setBudgetsState((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    }, []);

    const removeBudget = useCallback(
        (id: number) => {
            setBudgetsState((prev) => prev.filter((p) => p.id !== id));
            if (selectedId === id) setSelectedId(undefined);
        },
        [selectedId],
    );

    const selectBudget = useCallback((id?: number) => {
        setSelectedId(id);
    }, []);

    const clearSelection = useCallback(() => setSelectedId(undefined), []);

    const selectedBudget = useMemo(() => budgets.find((b) => b.id === selectedId), [budgets, selectedId]);

    const totalAmount = useMemo(() => budgets.reduce((s, b) => s + (Number(b.amount) || 0), 0), [budgets]);

    const updateBudgetAmount = useCallback((id: number, amount: number) => {
        setBudgetsState((prev) => prev.map((b) => (b.id === id ? { ...b, amount } : b)));
    }, []);

    useEffect(() => {
        setEnabledSave(false);
        const totalAmount = budgets.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        if (totalAmount > 100) {
            setfeedbackMessage({ msg: "A soma dos orçamentos não pode exceder 100%.", type: "error" });
        } else if (totalAmount < 100) {
            setfeedbackMessage({ msg: "A soma dos orçamentos está abaixo de 100%.", type: "warning" });
        } else {
            setfeedbackMessage({ msg: "Utilize o botao salvar para atualizar as metas", type: "info" });
            setEnabledSave(true);
        }
    }, [budgets]);

    const value: BudgetContextValue = useMemo(
        () => ({
            budgets,
            selectedBudget,
            loading,
            totalAmount,
            setBudgets,
            addBudget,
            updateBudget,
            removeBudget,
            selectBudget,
            clearSelection,
            updateBudgetAmount,
            feedbackMessage,
            enabledSave,
        }),
        [
            budgets,
            selectedBudget,
            loading,
            totalAmount,
            setBudgets,
            addBudget,
            updateBudget,
            removeBudget,
            selectBudget,
            clearSelection,
            updateBudgetAmount,
            feedbackMessage,
            enabledSave,
        ],
    );

    return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};

export const useBudget = (): BudgetContextValue => {
    const ctx = useContext(BudgetContext);
    if (!ctx) throw new Error("useBudget must be used within BudgetProvider");
    return ctx;
};

export default BudgetProvider;
