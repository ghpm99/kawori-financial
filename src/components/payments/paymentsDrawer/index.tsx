import { useEffect } from "react";

import { IPaymentDetail } from "@/components/providers/payments";
import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space, Switch } from "antd";
import dayjs from "dayjs";

interface PaymentsDrawerProps {
    open: boolean;
    onClose: () => void;
    paymentDetail?: IPaymentDetail;
    isLoading?: boolean;
    onUpdatePaymentDetail: (values: IPaymentDetail) => void;
}

const { Option } = Select;

const PaymentsDrawer = ({ open, onClose, paymentDetail, isLoading, onUpdatePaymentDetail }: PaymentsDrawerProps) => {
    const [form] = Form.useForm();
    useEffect(() => {
        if (open && paymentDetail) {
            const init = {
                ...paymentDetail,
                value: typeof paymentDetail.value === "number" ? Math.round(paymentDetail.value * 100) : 0,
                date: paymentDetail.date ? dayjs(paymentDetail.date) : undefined,
                payment_date: paymentDetail.payment_date ? dayjs(paymentDetail.payment_date) : undefined,
            };
            form.setFieldsValue(init);
        } else {
            form.resetFields();
        }
    }, [form, open, paymentDetail]);

    const formatter = (value: number | string | undefined) => {
        const cents = typeof value === "number" ? value : Number(String(value || "").replace(/\D+/g, "")) || 0;
        const floatValue = cents / 100;
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(floatValue);
    };

    const parser = (value: string | undefined): number => {
        if (!value) return 0;
        const digits = String(value).replace(/\D+/g, "");
        if (!digits) return 0;
        return Number(digits);
    };

    const onFinish = (values: IPaymentDetail) => {
        const payload = {
            ...values,
            value: typeof values.value === "number" ? Number((values.value / 100).toFixed(2)) : 0,
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : new Date().toISOString().split("T")[0],
            payment_date: values.payment_date
                ? dayjs(values.payment_date).format("YYYY-MM-DD")
                : new Date().toISOString().split("T")[0],
        };
        onClose();
        onUpdatePaymentDetail(payload);
    };

    const handleSubmitForm = () => {
        form.submit();
    };
    return (
        <Drawer
            title={paymentDetail ? `Pagamento #${paymentDetail.id}` : "Novo Pagamento"}
            size="large"
            onClose={onClose}
            open={open}
            loading={isLoading}
            styles={{
                body: {
                    paddingBottom: 80,
                },
            }}
            extra={
                <Space>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="primary" onClick={handleSubmitForm}>
                        Salvar
                    </Button>
                </Space>
            }
        >
            <Form form={form} layout="vertical" variant="underlined" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="id" label="ID">
                            <Input placeholder="Please enter user name" disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="contract" label="contrato" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="contract_name"
                            label="Contrato"
                            rules={[{ required: true, message: "Please enter url" }]}
                        >
                            <Input placeholder="Please enter user name" disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="invoice" label="Nota" hidden>
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="invoice_name"
                            label="Nota"
                            rules={[{ required: true, message: "Please select an owner" }]}
                        >
                            <Select placeholder="Please select an owner" disabled>
                                <Option value="xiao">Xiaoxiao Fu</Option>
                                <Option value="mao">Maomao Zhou</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Nome"
                            rules={[{ required: true, message: "Please choose the type" }]}
                        >
                            <Select placeholder="Please choose the type">
                                <Option value="private">Private</Option>
                                <Option value="public">Public</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Dia de lançamento"
                            rules={[{ required: true, message: "Please choose the approver" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="payment_date"
                            label="Dia de pagamento"
                            rules={[{ required: true, message: "Please choose the dateTime" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: "Please select an owner" }]}
                        >
                            <Select placeholder="Please select an owner" disabled>
                                <Option value={0}>Em aberto</Option>
                                <Option value={1}>Baixado</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Tipo"
                            rules={[{ required: true, message: "Please choose the type" }]}
                        >
                            <Select placeholder="Please choose the type">
                                <Option value={0}>Credito</Option>
                                <Option value={1}>Debito</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="installments"
                            label="Parcelas"
                            rules={[{ required: true, message: "Please select an owner" }]}
                        >
                            <Select placeholder="Please select an owner" disabled>
                                <Option value="xiao">Xiaoxiao Fu</Option>
                                <Option value="mao">Maomao Zhou</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="value"
                            label="Valor"
                            rules={[{ required: true, message: "Please choose the type" }]}
                        >
                            <InputNumber
                                step={1}
                                precision={0}
                                formatter={formatter}
                                parser={parser}
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="fixed"
                            label="Fixo"
                            rules={[{ required: true, message: "Please select an owner" }]}
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="active"
                            label="Ativo"
                            rules={[{ required: true, message: "Please choose the type" }]}
                        >
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default PaymentsDrawer;
