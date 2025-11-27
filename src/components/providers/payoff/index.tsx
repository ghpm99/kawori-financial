import { createContext, useContext, useMemo, useRef, useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";

import { payoffPaymentService } from "@/services/financial/payoff";

import ModalPayoff from "@/components/payments/modalPayoff";

import axios from "axios";
import { useSelectPayments } from "../selectPayments";

export type PayoffPayment = {
    id: number;
    name: string;
    description: string;
    status: "pending" | "completed" | "failed";
};

type PayoffContextValue = {
    paymentsToProcess: PayoffPayment[];
    setPaymentsToProcess: (payments: PayoffPayment[]) => void;
    clearPaymentsToProcess: () => void;
    paymentPayoffBatchProgress: number;
    paymentPayoffBatchPercentFailed: number;
    paymentPayoffBatchProgressText: () => string;
    openPayoffBatchModal: () => void;
    closePayoffBatchModal: () => void;
    modalBatchVisible: boolean;
    processPayOffBatch: () => void;
    payOffPayment: (id: number) => void;
    processPayOffBatchCompleted: boolean;
    processingBatch: boolean;
    setCallback: (cb: () => void) => void;
    clearCallback: () => void;
    runCallback: () => void;
};

const PayoffContext = createContext<PayoffContextValue | undefined>(undefined);

const messageKey = "payment_payoff_message";

export const PayoffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    const { selectedRow, clearSelection } = useSelectPayments();
    const [modalBatchVisible, setModalBatchVisible] = useState<boolean>(false);
    const [processingBatch, setProcessingBatch] = useState<boolean>(false);
    const [paymentsToProcess, setPaymentsToProcess] = useState<PayoffPayment[]>([]);
    const callbackRef = useRef<(() => void) | null>(null);

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

    const paymentPayoffBatchPercentFailed = useMemo(() => {
        const totalItems = paymentsToProcess.length;
        if (totalItems === 0) return 0;
        return Math.round((failedItems / totalItems) * 100);
    }, [paymentsToProcess, failedItems]);

    const processPayOffBatchCompleted = useMemo(() => {
        return paymentsToProcess.length > 0 && completedItems + failedItems === paymentsToProcess.length;
    }, [paymentsToProcess.length, completedItems, failedItems]);

    const { mutateAsync: mutatePayoffPaymentAsync } = useMutation({
        mutationKey: ["payoffPayment"],
        mutationFn: async (id: number) => {
            const response = await payoffPaymentService(id);
            return response;
        },
        onSuccess: () => {
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

    const setCallback = (cb: () => void) => {
        callbackRef.current = cb;
    };

    const clearCallback = () => {
        callbackRef.current = null;
    };

    const runCallback = () => {
        if (callbackRef.current) {
            callbackRef.current();
        }
    };

    const payOffPayment = async (id: number) => {
        message.loading({
            key: messageKey,
            content: "Processando",
        });
        try {
            const { msg } = await mutatePayoffPaymentAsync(id);
            message.success({
                content: msg,
                key: messageKey,
            });
        } catch (err: unknown) {
            let msgError = "";

            if (axios.isAxiosError(err)) {
                msgError = (err.response?.data as { msg?: string })?.msg ?? err.message;
            } else {
                msgError = "Falhou em baixar pagamento";
            }

            message.error({
                content: msgError,
                key: messageKey,
            });
        }
    };

    const updatePaymentStatusAndDescription = async (
        id: number,
        status: "completed" | "failed",
        description: string,
    ) => {
        setPaymentsToProcess((prevPayments) =>
            prevPayments.map((payment) =>
                payment.id === id ? { ...payment, status: status, description: description } : payment,
            ),
        );
    };

    const processPayOffBatch = async () => {
        setProcessingBatch(true);
        clearSelection();
        for (const payment of paymentsToProcess) {
            try {
                const { msg } = await mutatePayoffPaymentAsync(payment.id);
                updatePaymentStatusAndDescription(payment.id, "completed", msg);
            } catch (err: unknown) {
                let msgError = "";

                if (axios.isAxiosError(err)) {
                    msgError = (err.response?.data as { msg?: string })?.msg ?? err.message;
                } else {
                    msgError = "Falhou em baixar pagamento";
                }

                updatePaymentStatusAndDescription(payment.id, "failed", msgError);
            }
        }
        setProcessingBatch(false);
        runCallback();
    };

    const openPayoffBatchModal = () => {
        const dataSource: PayoffPayment[] = selectedRow
            .filter((row) => row.selected)
            .map((row) => ({
                id: parseInt(row.id.toString()),
                name: row.name,
                description: "Aguardando",
                status: "pending",
            }));
        setPaymentsToProcess(dataSource);
        setModalBatchVisible(true);
    };

    const closePayoffBatchModal = () => {
        setPaymentsToProcess([]);
        clearCallback();
        setModalBatchVisible(false);
    };

    return (
        <PayoffContext.Provider
            value={{
                paymentsToProcess,
                setPaymentsToProcess,
                clearPaymentsToProcess,
                paymentPayoffBatchProgress,
                paymentPayoffBatchPercentFailed,
                paymentPayoffBatchProgressText,
                openPayoffBatchModal,
                closePayoffBatchModal,
                modalBatchVisible,
                processPayOffBatch,
                payOffPayment,
                processPayOffBatchCompleted,
                processingBatch,
                setCallback,
                clearCallback,
                runCallback,
            }}
        >
            {children}
            <ModalPayoff
                visible={modalBatchVisible}
                onCancel={closePayoffBatchModal}
                onPayoff={processPayOffBatch}
                data={paymentsToProcess}
                percent={paymentPayoffBatchProgress}
                percentFailed={paymentPayoffBatchPercentFailed}
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
