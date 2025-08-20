import { DatePicker, Form, Input, InputNumber, Modal, Select, Switch } from "antd";

import styles from "./ModalNew.module.scss";

interface IModalNewProps {
    visible: boolean;
    onCancel: (e: React.MouseEvent<HTMLElement>) => void;
    onFinish: ((values: IFormModalNew) => void) | undefined;
}

interface IFormModalNew {
    type: number;
    name: string;
    date: Date;
    installments: number;
    payment_date: Date;
    value: number;
    fixed: boolean;
}

export default function ModalNew(props: IModalNewProps) {
    const { Option } = Select;

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

    const dateFormat = "DD/MM/YYYY";
    const customFormat = (value: any) => `${value.format(dateFormat)}`;

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
                name="payment"
                onFinish={props.onFinish}
                preserve={false}
            >
                <Form.Item
                    style={{ width: "auto" }}
                    label="Tipo"
                    name="type"
                    rules={[
                        {
                            required: true,
                            message: "Selecione o tipo de entrada",
                        },
                    ]}
                >
                    <Select placeholder="Selecione o tipo de entrada">
                        <Option value={0}>Credito</Option>
                        <Option value={1}>Debito</Option>
                    </Select>
                </Form.Item>
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
                <Form.Item
                    label="Data"
                    name="date"
                    rules={[
                        {
                            required: true,
                            message: "Selecione a data da entrada",
                        },
                    ]}
                >
                    <DatePicker format={customFormat} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    label="Parcelas"
                    name="installments"
                    rules={[
                        {
                            required: true,
                            message: "Digite o numero de parcelas",
                        },
                    ]}
                >
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item
                    label="Dia de pagamento"
                    name="payment_date"
                    rules={[
                        {
                            required: true,
                            message: "Selecione a data do pagamento",
                        },
                    ]}
                >
                    <DatePicker format={customFormat} style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Valor" name="value" rules={[{ required: true, message: "Digite o valor" }]}>
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Entrada mensal" name="fixed" valuePropName="checked">
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
}
