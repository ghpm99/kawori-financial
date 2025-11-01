import { PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";

import { changeVisibleContractsModal } from "@/lib/features/financial/contract";
import { useAppDispatch, useAppStore } from "@/lib/hooks";
import { updateAllContractsValue } from "@/services/financial";

const OpenModalNewContract = () => {
    const dispatch = useAppDispatch();

    const openModal = (modal: keyof IModalContracts) => {
        dispatch(changeVisibleContractsModal({ modal: modal, visible: true }));
    };

    const updateContractsValue = () => {
        message.loading({
            content: "Calculando contratos",
            key: "calculate-contracts",
        });
        updateAllContractsValue().then((response) => {
            message.success({
                content: response.data.msg,
                key: "calculate-contracts",
            });
        });
    };
    return (
        <div>
            <Button type="primary" onClick={updateContractsValue}>
                Calcular valores contratos
            </Button>
            <Button icon={<PlusOutlined />} onClick={() => openModal("newPayment")} data-testid="button-open-modal">
                Novo
            </Button>
        </div>
    );
};

export default OpenModalNewContract;
