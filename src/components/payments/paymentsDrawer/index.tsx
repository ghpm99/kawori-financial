import { Button, Col, Drawer, Form, Input, InputNumber, Row, Select, Space, Switch, Typography } from "antd";
import { useEffect } from "react";

interface PaymentsDrawerProps {
    open: boolean;
    onClose: () => void;
    paymentDetail?: IPaymentDetail;
    isLoading?: boolean;
}

const { Paragraph } = Typography;
const { Option } = Select;

const PaymentsDrawer = ({ open, onClose, paymentDetail, isLoading }: PaymentsDrawerProps) => {
    console.log("Payment Detail in Drawer:", paymentDetail);
    const [form] = Form.useForm();
    useEffect(() => {
        if (open && paymentDetail) {
            form.setFieldsValue(paymentDetail);
        } else {
            form.resetFields();
        }
    }, [form, open, paymentDetail]);

    const formatter = (value) => {
        const onlyNumbers = value.replace(/\D+/g, "");
        const intNumber = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        }).format(Number(onlyNumbers) / 100);
        return intNumber;
    };

    const parser = (value: string): number => {
        if (!value) return 0;
        const onlyNumCommaDot = value.replace(/[^\d.,-]/g, "");
        const withoutThousands = onlyNumCommaDot.replace(/\.(?=\d{3}(?:[.,]|$))/g, "");
        const normalized = withoutThousands.replace(/,/g, ".");
        let cleaned = normalized.replace(/(?!^)-|[^0-9.-]/g, "");
        const dots = (cleaned.match(/\./g) || []).length;
        if (dots > 1) {
            const parts = cleaned.split(".");
            const first = parts.shift() ?? "";
            cleaned = first + "." + parts.join("");
        }
        const num = Number(cleaned);
        return Number.isFinite(num) ? num : 0;
    };

    const onFinish = (values) => {
        console.log("Form values:", values);
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
            <Form form={form} layout="vertical" hideRequiredMark variant="underlined" onFinish={onFinish}>
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
                            <Input placeholder="Please enter user name" />
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
                            <Select placeholder="Please select an owner">
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
                            <Input placeholder="Please enter user name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="payment_date"
                            label="Dia de pagamento"
                            rules={[{ required: true, message: "Please choose the dateTime" }]}
                        >
                            <Input placeholder="Please enter user name" />
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
                            <Select placeholder="Please select an owner">
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
                            <Select placeholder="Please select an owner">
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
                            <InputNumber stringMode formatter={formatter} parser={parser} style={{ width: "100%" }} />
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
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[
                                {
                                    required: true,
                                    message: "please enter url description",
                                },
                            ]}
                        >
                            <Input.TextArea rows={4} placeholder="please enter url description" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default PaymentsDrawer;
