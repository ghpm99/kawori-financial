import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    LoadingOutlined,
} from "@ant-design/icons";
import { Button, Modal, Table } from "antd";

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
