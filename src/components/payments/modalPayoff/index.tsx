import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Button, Layout, Modal, Progress, Spin, Table } from "antd";
import { useState } from "react";
import styles from "./modalPayoff.module.scss";

export interface ITableDataSource {
    status: number;
    id: number;
    description: string;
}

interface IModalPayoffProps {
    visible: boolean;
    onCancel: () => void;
    onPayoff: () => void;
    percent: number;
    progressText: string;
    data: ITableDataSource[];
}

const ModalPayoff = (props: IModalPayoffProps) => {
    const [percent, setPercent] = useState(0);
    const inProgressItems = props.data.filter((item) => item.status === 0).length;
    const completedItems = props.data.filter((item) => item.status === 1).length;
    const failedItems = props.data.filter((item) => item.status === 3).length;

    const progressText = () => {
        const totalItems = props.data.length;
        if (totalItems === 0) return "Sem itens para processar";
        if (completedItems === totalItems) {
            return "Todos concluídos com sucesso";
        }
        if (failedItems === totalItems) {
            return "Todos falharam no processamento";
        }
        if (failedItems > 0) {
            return `${completedItems}/${totalItems} concluídos, ${failedItems} falharam`;
        }
        if (completedItems > 0) {
            return `${completedItems}/${totalItems} concluídos com sucesso`;
        }
        return `Aguardando processamento, total de ${totalItems} itens`;
    };

    const percentProgress = (() => {
        const totalItems = props.data.length;
        const inProgressItems = props.data.filter((item) => item.status === 0).length;
        const completedItems = props.data.filter((item) => item.status === 1).length;
        const totalProcessed = completedItems / totalItems;
        const percentInProgress = inProgressItems / totalItems;

        return {
            percent: totalProcessed,
            success: percentInProgress,
        };
    })();

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

    return (
        <Modal
            title="Baixar pagamentos"
            open={props.visible}
            onCancel={props.onCancel}
            footer={[
                <Button key="back" onClick={props.onCancel}>
                    Voltar
                </Button>,
                <Button key="payoff" onClick={props.onPayoff} type="primary">
                    Processar
                </Button>,
            ]}
        >
            <div className={styles["progress"]}>
                <Progress
                    type="circle"
                    percent={percentProgress.percent}
                    success={{ percent: percentProgress.success }}
                />
                {progressText()}
            </div>
        </Modal>
    );
};

export default ModalPayoff;
