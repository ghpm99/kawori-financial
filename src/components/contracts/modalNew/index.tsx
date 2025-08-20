import { Form, Input, Modal } from "antd";
import { MouseEvent } from "react";

import styles from "./ModalNew.module.scss";

export interface INewContractForm {
    name: string;
}
interface IModalNewProps {
    visible: boolean;
    onCancel?: (e: React.MouseEvent<HTMLElement>) => void;
    onFinish?: ((values: INewContractForm) => void) | undefined;
}

export default function ModalNew(props: IModalNewProps) {
    const [form] = Form.useForm();

    const onOk = () => {
        form.submit();
    };

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 8 },
        },
        wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
        },
    };

    return (
        <Modal
            title="Nova entrada"
            visible={props.visible}
            onCancel={props.onCancel}
            okButtonProps={{ htmlType: "submit" }}
            onOk={onOk}
        >
            <Form
                {...formItemLayout}
                form={form}
                className={styles.form}
                name="contract"
                onFinish={props.onFinish}
                preserve={false}
            >
                <Form.Item
                    label="Nome"
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: "Entre com o nome da entrada",
                        },
                    ]}
                >
                    <Input placeholder="Digite o nome" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
