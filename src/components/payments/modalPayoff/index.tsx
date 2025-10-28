import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Button, Modal, Progress, Spin, Table } from "antd";
import { useState } from "react";

export interface ITableDataSource {
    status: number;
    id: number;
    description: string;
}

interface IModalPayoffProps {
    visible: boolean;
    onCancel: () => void;
    onPayoff: () => void;
    data: ITableDataSource[];
}

const ModalPayoff = (props: IModalPayoffProps) => {
    const [percent, setPercent] = useState(0);

    const progressText = () => {
        const totalItems = props.data.length;
        if (totalItems === 0) return "Sem itens para processar";
        const inProgressItems = props.data.filter((item) => item.status === 0).length;
        const completedItems = props.data.filter((item) => item.status === 1).length;
        const failedItems = props.data.filter((item) => item.status === 3).length;
        if (completedItems === totalItems) {
            return "100%";
        }
        if (failedItems === totalItems) {
            return "Falhou";
        }
        if (failedItems > 0) {
            return `${completedItems}/${totalItems}, ${failedItems}`;
        }
        if (completedItems > 0) {
            return `${completedItems}/${totalItems}`;
        }
        return `0% ${totalItems}`;
    };

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
            <Spin percent={percent} />
            <Progress type="circle" percent={percent} format={progressText} />
            <Table
                columns={[
                    {
                        title: "Status",
                        key: "status",
                        dataIndex: "status",
                        render: (value) => <div>{statusIcon(value)}</div>,
                    },
                    {
                        title: "Id",
                        key: "id",
                        dataIndex: "id",
                    },
                    {
                        title: "Descrição",
                        key: "description",
                        dataIndex: "description",
                    },
                ]}
                dataSource={props.data}
            />
        </Modal>
    );
};

export default ModalPayoff;
