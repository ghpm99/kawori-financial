import { DatePicker, Form, Input, InputNumber, Modal, Select } from "antd";
import dayjs from "dayjs";
import { MouseEvent } from "react";

import styles from "./ModalFilter.module.scss";

interface IModalFilterProps {
    visible: boolean;
    onCancel: (e: React.MouseEvent<HTMLElement>) => void;
    setFilters: ((values: IFormModalFilter) => void) | undefined;
}

interface IFormModalFilter {
    status: number;
    type: number;
    name: string;
    date: Date;
    installments: number;
    payment_date: Date;
    value: number;
    fixed: boolean;
    active: boolean;
}

export default function ModalFilter(props: IModalFilterProps) {
    const [formFilters] = Form.useForm();

    const { Option } = Select;
    const { RangePicker } = DatePicker;

    const okFilters = () => {
        formFilters.submit();
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
            title="Filtro"
            visible={props.visible}
            onCancel={props.onCancel}
            okButtonProps={{ htmlType: "submit" }}
            onOk={okFilters}
        >
            <Form
                {...formItemLayout}
                form={formFilters}
                className={styles.form}
                name="filter"
                onFinish={props.setFilters}
                preserve={false}
            >
                <Form.Item style={{ width: "auto" }} label="Status" name="status">
                    <Select placeholder="Selecione o status">
                        <Option value="">Todos</Option>
                        <Option value={0}>Em aberto</Option>
                        <Option value={1}>Baixado</Option>
                    </Select>
                </Form.Item>
                <Form.Item style={{ width: "auto" }} label="Tipo" name="type">
                    <Select placeholder="Selecione o tipo de entrada">
                        <Option value="">Todos</Option>
                        <Option value={0}>Credito</Option>
                        <Option value={1}>Debito</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Nome" name="name">
                    <Input placeholder="Digite o nome" />
                </Form.Item>
                <Form.Item label="Data" name="date">
                    <RangePicker
                        format={customFormat}
                        style={{ width: "100%" }}
                        ranges={{
                            Hoje: [dayjs(), dayjs()],
                            Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                            "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                            "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                            "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                            "Proximo mês": [
                                dayjs().add(1, "months").startOf("month"),
                                dayjs().add(1, "months").endOf("month"),
                            ],
                            "Mês passado": [
                                dayjs().subtract(1, "month").startOf("month"),
                                dayjs().subtract(1, "month").endOf("month"),
                            ],
                        }}
                    />
                </Form.Item>
                <Form.Item label="Parcelas" name="installments">
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Dia de pagamento" name="payment_date">
                    <RangePicker
                        format={customFormat}
                        style={{ width: "100%" }}
                        ranges={{
                            Hoje: [dayjs(), dayjs()],
                            Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                            "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                            "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                            "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                            "Proximo mês": [
                                dayjs().add(1, "months").startOf("month"),
                                dayjs().add(1, "months").endOf("month"),
                            ],
                            "Mês passado": [
                                dayjs().subtract(1, "month").startOf("month"),
                                dayjs().subtract(1, "month").endOf("month"),
                            ],
                        }}
                    />
                </Form.Item>
                <Form.Item label="Valor" name="value">
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
                <Form.Item label="Entrada mensal" name="fixed" valuePropName="checked">
                    <Select placeholder="Selecione se é mensalidade">
                        <Option value={""}>Todos</Option>
                        <Option value={true}>Sim</Option>
                        <Option value={false}>Não</Option>
                    </Select>
                </Form.Item>
                <Form.Item label="Ativo" name="active" valuePropName="checked">
                    <Select placeholder="Selecione se esta em aberto">
                        <Option value={""}>Todos</Option>
                        <Option value={true}>Sim</Option>
                        <Option value={false}>Não</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
}
