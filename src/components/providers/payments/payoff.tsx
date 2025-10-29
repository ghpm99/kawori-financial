import { payoffPaymentService } from "@/services/financial";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { createContext, useContext, useMemo, useState } from "react";

type PayoffPayment = {
    id: number;
    description: string;
    status: "pending" | "completed" | "failed";
};

type PayoffContextValue = {
    paymentsToProcess: PayoffPayment[];
    setPaymentsToProcess: (payments: PayoffPayment[]) => void;
    clearPaymentsToProcess: () => void;
    paymentPayoffBatchProgress: number;
    paymentPayoffBatchProgressText: () => string;
};

const PayoffContext = createContext<PayoffContextValue | undefined>(undefined);

const messageKey = "payment_payoff_message";

export const PayoffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();
    const [paymentsToProcess, setPaymentsToProcess] = useState<PayoffPayment[]>([]);
    const clearPaymentsToProcess = () => setPaymentsToProcess([]);

    const pendingItems = useMemo(
        () => paymentsToProcess.filter((p) => p.status === "pending").length,
        [paymentsToProcess],
    );
    const completedItems = useMemo(
        () => paymentsToProcess.filter((p) => p.status === "completed").length,
        [paymentsToProcess],
    );
    const failedItems = useMemo(
        () => paymentsToProcess.filter((p) => p.status === "failed").length,
        [paymentsToProcess],
    );

    const paymentPayoffBatchProgress = useMemo(() => {
        const totalItems = paymentsToProcess.length;
        if (totalItems === 0) return 0;
        return ((completedItems + failedItems) / totalItems) * 100;
    }, [paymentsToProcess, completedItems, failedItems]);

    const { mutate: mutatePayoffPayment } = useMutation({
        mutationKey: ["payoffPayment"],
        mutationFn: async (id: number) => {
            const response = await payoffPaymentService(id);
            return response;
        },
        onSuccess: ({ msg }, id: number) => {
            message.success({
                content: msg,
                key: messageKey,
            });
            queryClient.invalidateQueries({ queryKey: ["payments"] });
        },
    });

    const paymentPayoffBatchProgressText = () => {
        if (paymentsToProcess.length === 0) return "Sem itens para processar";
        if (completedItems === paymentsToProcess.length) {
            return "Todos concluídos com sucesso";
        }
        if (failedItems === paymentsToProcess.length) {
            return "Todos falharam no processamento";
        }
        if (failedItems > 0) {
            return `${completedItems}/${paymentsToProcess.length} concluídos, ${failedItems} falharam`;
        }
        if (completedItems > 0) {
            return `${completedItems}/${paymentsToProcess.length} concluídos com sucesso`;
        }
        return `Aguardando processamento, total de ${paymentsToProcess.length} itens`;
    };

    const payOffPayment = (id: number) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        mutatePayoffPayment(id);
    };

    const processPayOffMassive = () => {};

    return (
        <PayoffContext.Provider
            value={{
                paymentsToProcess,
                setPaymentsToProcess,
                clearPaymentsToProcess,
                paymentPayoffBatchProgress,
                paymentPayoffBatchProgressText,
            }}
        >
            {children}
        </PayoffContext.Provider>
    );
};

export const usePayoff = (): PayoffContextValue => {
    const ctx = useContext(PayoffContext);
    if (!ctx) throw new Error("usePayoff must be used within PayoffProvider");
    return ctx;
};
