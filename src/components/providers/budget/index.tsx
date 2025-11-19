import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertProps, message } from "antd";
import { AxiosError } from "axios";
import { Dayjs } from "dayjs";

import { fetchAllBudgetService, resetBudgetService, saveBudgetService } from "@/services/financial";
const messageKey = "budget_message";
export interface IBudget {
    id: number;
    name: string;
    allocation_percentage: number;
    estimated_expense: number;
    actual_expense: number;
    difference: number;
    color: string;
}

type FeedbackMessageType = { msg: string; type: AlertProps["type"] };

type BudgetContextValue = {
    budgets: IBudget[];
    data: IBudget[];
    selectedBudget?: IBudget;
    isLoading: boolean;
    totalAmount: number;
    setBudgets: (items: IBudget[]) => void;
    addBudget: (b: IBudget) => void;
    updateBudget: (id: number, patch: Partial<IBudget>) => void;
    removeBudget: (id: number) => void;
    selectBudget: (id?: number) => void;
    clearSelection: () => void;
    updateBudgetAllocationPercentage: (id: number, allocation_percentage: number) => void;
    feedbackMessage: FeedbackMessageType;
    enabledSave: boolean;
    saveBudgets: () => void;
    changePeriodFilter: (date: Dayjs, dateString: string | string[]) => void;
    periodFilter: string;
    resetBudgets: () => void;
};

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [budgets, setBudgetsState] = useState<IBudget[]>([]);
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
    const [periodFilter, setPeriodFilter] = useState<string>(
        new Date().toLocaleDateString("pt-BR", { month: "2-digit", year: "numeric" }),
    );

    const [enabledSave, setEnabledSave] = useState(false);
    const [feedbackMessage, setfeedbackMessage] = useState<FeedbackMessageType>({
        msg: "",
        type: "info",
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["budgets", periodFilter],
        queryFn: async () => {
            const response = await fetchAllBudgetService(periodFilter);
            return response.data;
        },
    });

    const { mutate: saveBudgetsMutate } = useMutation({
        mutationFn: async (data: IBudget[]) => {
            const response = await saveBudgetService(data);
            return response.msg;
        },
        onSuccess: (msg) => {
            refetch();
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: AxiosError) => {
            message.error({
                content: error.response?.data?.msg || "Erro ao salvar orçamentos.",
                key: messageKey,
            });
        },
    });

    const { mutate: resetBudgetsMutate } = useMutation({
        mutationFn: async (period: string) => {
            const response = await resetBudgetService();
            return response.msg;
        },
        onSuccess: (msg) => {
            refetch();
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: AxiosError) => {
            message.error({
                content: error.response?.data?.msg || "Erro ao resetar orçamentos.",
                key: messageKey,
            });
        },
    });

    useEffect(() => {
        if (data) {
            setBudgetsState(data);
        }
    }, [data]);

    const changePeriodFilter = useCallback((date: Dayjs, dateString: string) => {
        setPeriodFilter(dateString);
    }, []);

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

    const totalAmount = useMemo(
        () => budgets.reduce((s, b) => s + (Number(b.allocation_percentage) || 0), 0),
        [budgets],
    );

    const updateBudgetAllocationPercentage = useCallback((id: number, allocation_percentage: number) => {
        setBudgetsState((prev) => prev.map((b) => (b.id === id ? { ...b, allocation_percentage } : b)));
    }, []);

    useEffect(() => {
        setEnabledSave(false);
        if (totalAmount > 100) {
            setfeedbackMessage({ msg: "A soma dos orçamentos não pode exceder 100%.", type: "error" });
        } else if (totalAmount < 100) {
            setfeedbackMessage({ msg: "A soma dos orçamentos está abaixo de 100%.", type: "warning" });
        } else {
            setfeedbackMessage({ msg: "Utilize o botao salvar para atualizar as metas", type: "info" });
            setEnabledSave(true);
        }
    }, [totalAmount]);

    const saveBudgets = useCallback(() => {
        saveBudgetsMutate(budgets);
    }, [budgets, saveBudgetsMutate]);

    const resetBudgets = useCallback(() => {
        resetBudgetsMutate(periodFilter);
    }, [periodFilter, resetBudgetsMutate]);

    const value: BudgetContextValue = useMemo(
        () => ({
            budgets,
            data,
            selectedBudget,
            isLoading,
            totalAmount,
            setBudgets,
            addBudget,
            updateBudget,
            removeBudget,
            selectBudget,
            clearSelection,
            updateBudgetAllocationPercentage,
            feedbackMessage,
            enabledSave,
            saveBudgets,
            changePeriodFilter,
            periodFilter,
            resetBudgets,
        }),
        [
            budgets,
            data,
            selectedBudget,
            isLoading,
            totalAmount,
            setBudgets,
            addBudget,
            updateBudget,
            removeBudget,
            selectBudget,
            clearSelection,
            updateBudgetAllocationPercentage,
            feedbackMessage,
            enabledSave,
            saveBudgets,
            changePeriodFilter,
            periodFilter,
            resetBudgets,
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
