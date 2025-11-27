import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { fetchAllBudgetService, resetBudgetService, saveBudgetService } from "@/services/financial/budget";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertProps, message } from "antd";
import { AxiosError } from "axios";
import dayjs, { Dayjs } from "dayjs";

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
    periodFilter: Dayjs;
    resetBudgets: () => void;
};

const BudgetContext = createContext<BudgetContextValue | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [budgets, setBudgetsState] = useState<IBudget[]>([]);
    const [selectedId, setSelectedId] = useState<number | undefined>(undefined);
    const [periodFilter, setPeriodFilter] = useState<Dayjs>(dayjs());

    const { data, isLoading } = useQuery({
        queryKey: ["budgets", periodFilter],
        queryFn: async () => {
            const periodDate = periodFilter.format("MM/YYYY");
            const response = await fetchAllBudgetService(periodDate);
            const budgets = response.data;
            setBudgetsState(budgets);
        },
    });

    const { mutate: saveBudgetsMutate } = useMutation({
        mutationFn: async (data: IBudget[]) => {
            const response = await saveBudgetService(data);
            return response.msg;
        },
        onSuccess: (msg) => {
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: AxiosError) => {
            message.error({
                content: (error.response?.data as CommonApiResponse)?.msg || "Erro ao salvar orçamentos.",
                key: messageKey,
            });
        },
    });

    const { mutate: resetBudgetsMutate } = useMutation({
        mutationFn: async () => {
            const response = await resetBudgetService();
            return response.msg;
        },
        onSuccess: (msg) => {
            message.success({
                content: msg,
                key: messageKey,
            });
        },
        onError: (error: AxiosError) => {
            message.error({
                content: (error.response?.data as CommonApiResponse)?.msg || "Erro ao resetar orçamentos.",
                key: messageKey,
            });
        },
    });

    const changePeriodFilter = useCallback((date: Dayjs) => {
        setPeriodFilter(date);
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

    const { shouldEnableSave, feedback } = useMemo((): { shouldEnableSave: boolean; feedback: FeedbackMessageType } => {
        if (totalAmount > 100) {
            return {
                shouldEnableSave: false,
                feedback: { msg: "A soma dos orçamentos não pode exceder 100%.", type: "error" },
            };
        } else if (totalAmount < 100) {
            return {
                shouldEnableSave: false,
                feedback: { msg: "A soma dos orçamentos está abaixo de 100%.", type: "warning" },
            };
        } else {
            return {
                shouldEnableSave: true,
                feedback: { msg: "Utilize o botão salvar para atualizar as metas", type: "info" },
            };
        }
    }, [totalAmount]);

    const saveBudgets = useCallback(() => {
        if (shouldEnableSave) {
            saveBudgetsMutate(budgets);
        }
    }, [budgets, saveBudgetsMutate, shouldEnableSave]);

    const resetBudgets = useCallback(() => {
        resetBudgetsMutate();
    }, [resetBudgetsMutate]);

    const value: BudgetContextValue = useMemo(
        () => ({
            budgets: budgets ?? [],
            data: data ?? [],
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
            feedbackMessage: feedback,
            enabledSave: shouldEnableSave,
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
            feedback,
            shouldEnableSave,
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
