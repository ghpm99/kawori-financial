import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Button, Modal, Progress, Table } from "antd";

import { PayoffPayment } from "@/components/providers/payoff";

import styles from "./modalPayoff.module.scss";

interface IModalPayoffProps {
    visible: boolean;
    onCancel: () => void;
    onPayoff: () => void;
    percent: number;
    percentFailed: number;
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
    percentFailed,
    progressText,
    data,
    completed,
    processing,
}: IModalPayoffProps) => {
    const statusIcon = (status: PayoffPayment["status"]) => {
        const icons = {
            pending: <LoadingOutlined style={{ color: "#1677ff" }} />, // azul
            completed: <CheckCircleOutlined style={{ color: "#52c41a" }} />, // verde
            failed: <ExclamationCircleOutlined style={{ color: "#faad14" }} />, // laranja
            cancelled: <CloseCircleOutlined style={{ color: "#ff4d4f" }} />, // vermelho
        };

        return icons[status] ?? <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
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
                    strokeColor="#52c41a" // verde
                    success={{
                        percent: percentFailed,
                        strokeColor: "#ff4d4f", // vermelho
                    }}
                />
                {progressText}
            </div>
            <Table
                columns={[
                    { title: "Pagamento", dataIndex: "name", key: "name" },
                    { title: "Descrição", dataIndex: "description", key: "description" },
                    { title: "Status", dataIndex: "status", key: "status", render: (value) => statusIcon(value) },
                ]}
                dataSource={data}
            />
        </Modal>
    );
};

export default ModalPayoff;
