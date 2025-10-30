import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Button, Layout, Modal, Progress, Spin, Table } from "antd";
import { useState } from "react";
import styles from "./modalPayoff.module.scss";
import { PayoffPayment } from "@/components/providers/payments/payoff";

interface IModalPayoffProps {
    visible: boolean;
    onCancel: () => void;
    onPayoff: () => void;
    percent: number;
    progressText: string;
    data: PayoffPayment[];
    completed: boolean;
    processing: boolean;
}

const ModalPayoff = ({
    visible,
    onCancel,
    onPayoff,
    percent,
    progressText,
    data,
    completed,
    processing,
}: IModalPayoffProps) => {
    const statusIcon = (status: number) => {
        if (status === 0) {
            return <LoadingOutlined />;
        } else if (status === 1) {
            return <CheckCircleOutlined />;
        } else if (status === 2) {
            return <ExclamationCircleOutlined />;
        } else {
            return <CloseCircleOutlined />;
        }
    };

    const footerButtons = () => {
        if (completed) {
            return [
                <Button key="back" onClick={onCancel} loading={processing}>
                    Fechar
                </Button>,
            ];
        }
        return [
            <Button key="back" onClick={onCancel} disabled={processing}>
                Voltar
            </Button>,
            <Button key="payoff" onClick={onPayoff} type="primary" loading={processing}>
                Processar
            </Button>,
        ];
    };
    return (
        <Modal title="Baixar pagamentos" open={visible} onCancel={onCancel} footer={footerButtons()}>
            <div className={styles["progress"]}>
                <Progress
                    type="circle"
                    percent={percent}
                    // success={{ percent: percentProgress.success }}
                />
                {progressText}
            </div>
        </Modal>
    );
};

export default ModalPayoff;
