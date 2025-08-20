import { Form, Input, Modal } from "antd";

import styles from "./ModalNew.module.scss";

interface IModalNewTagProps {
    visible: boolean;
    onCancel: (e: React.MouseEvent<HTMLElement>) => void;
    onFinish: ((values: IFormModalNewTag) => void) | undefined;
}

export interface IFormModalNewTag {
    name: string;
    color: string;
}

export default function ModalNewTag(props: IModalNewTagProps) {
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
            title="Nova tag"
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
                <Form.Item label="Nome" name="name" rules={[{ required: true, message: "Entre com o nome da tag" }]}>
                    <Input placeholder="Digite o nome" data-testid="tag-name" />
                </Form.Item>
                <Form.Item label="Cor" name="color">
                    <input type="color" data-testid="tag-color" />
                </Form.Item>
            </Form>
        </Modal>
    );
}
