import sleep from "timers";

import { createContext, useContext, useMemo, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

import { payoffPaymentService } from "@/services/financial";

import ModalPayoff from "@/components/payments/modalPayoff";

import { useSelectPayments } from "../selectPayments";

export type PayoffPayment = {
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
    openPayoffBatchModal: () => void;
    closePayoffBatchModal: () => void;
    modalBatchVisible: boolean;
    processPayOffBatch: () => void;
    payOffPayment: (id: number) => void;
    processPayOffBatchCompleted: boolean;
    processingBatch: boolean;
};

const PayoffContext = createContext<PayoffContextValue | undefined>(undefined);

const messageKey = "payment_payoff_message";

export const PayoffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    const { selectedRow } = useSelectPayments();
    const [modalBatchVisible, setModalBatchVisible] = useState<boolean>(false);
    const [processingBatch, setProcessingBatch] = useState<boolean>(false);
    const [paymentsToProcess, setPaymentsToProcess] = useState<PayoffPayment[]>([]);
    console.log(paymentsToProcess);

    const clearPaymentsToProcess = () => setPaymentsToProcess([]);

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
        return Math.round(((completedItems + failedItems) / totalItems) * 100);
    }, [paymentsToProcess, completedItems, failedItems]);

    const processPayOffBatchCompleted = useMemo(() => {
        return paymentsToProcess.length > 0 && completedItems + failedItems === paymentsToProcess.length;
    }, [paymentsToProcess.length, completedItems, failedItems]);

    console.log("paymentPayoffBatchProgress:", paymentPayoffBatchProgress);

    const { mutateAsync: mutatePayoffPaymentAsync } = useMutation({
        mutationKey: ["payoffPayment"],
        mutationFn: async (id: number) => {
            const response = await payoffPaymentService(id);
            return response;
        },
        onSuccess: ({ msg }, id) => {
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

    const payOffPayment = async (id: number) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        const { msg } = await mutatePayoffPaymentAsync(id);
        message.success({
            content: msg,
            key: messageKey,
        });
    };

    const updatePaymentStatus = async (id: number, status: "completed" | "failed") => {
        setPaymentsToProcess((prevPayments) =>
            prevPayments.map((payment) => (payment.id === id ? { ...payment, status: status } : payment)),
        );
    };

    const processPayOffBatch = async () => {
        setProcessingBatch(true);
        for (const payment of paymentsToProcess) {
            try {
                await mutatePayoffPaymentAsync(payment.id);
                updatePaymentStatus(payment.id, "completed");
            } catch (err) {
                updatePaymentStatus(payment.id, "failed");
            }
        }
        setProcessingBatch(false);
    };

    const openPayoffBatchModal = () => {
        const dataSource: PayoffPayment[] = selectedRow.map((id) => ({
            id: parseInt(id.toString()),
            description: "Aguardando",
            status: "pending",
        }));
        setPaymentsToProcess(dataSource);
        setModalBatchVisible(true);
    };
    const closePayoffBatchModal = () => {
        setModalBatchVisible(false);
    };

    return (
        <PayoffContext.Provider
            value={{
                paymentsToProcess,
                setPaymentsToProcess,
                clearPaymentsToProcess,
                paymentPayoffBatchProgress,
                paymentPayoffBatchProgressText,
                openPayoffBatchModal,
                closePayoffBatchModal,
                modalBatchVisible,
                processPayOffBatch,
                payOffPayment,
                processPayOffBatchCompleted,
                processingBatch,
            }}
        >
            {children}
            <ModalPayoff
                visible={modalBatchVisible}
                onCancel={closePayoffBatchModal}
                onPayoff={processPayOffBatch}
                data={paymentsToProcess}
                percent={paymentPayoffBatchProgress}
                progressText={paymentPayoffBatchProgressText()}
                completed={processPayOffBatchCompleted}
                processing={processingBatch}
            />
        </PayoffContext.Provider>
    );
};

export const usePayoff = (): PayoffContextValue => {
    const ctx = useContext(PayoffContext);
    if (!ctx) throw new Error("usePayoff must be used within PayoffProvider");
    return ctx;
};
