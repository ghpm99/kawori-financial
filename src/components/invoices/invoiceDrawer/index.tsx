import { useEffect } from "react";

import type { SelectProps } from "antd";
import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space, Switch, Tag } from "antd";
import dayjs from "dayjs";

import { IInvoiceDetail } from "@/components/providers/invoices";
import { ITags } from "@/components/providers/tags";
import { InvoicePayments } from "../payments";

interface InvoiceDrawerProps {
    open: boolean;
    onClose: () => void;
    invoiceDetail?: IInvoiceDetail;
    isLoading?: boolean;
    onUpdateInvoiceDetail: (values: IInvoiceDetail) => void;
    onCreateNewInvoice: (values: IInvoiceDetail) => void;
    tags_data: ITags[];
    isLoadingTags: boolean;
    isDefaultFixed?: boolean;
}

const { Option } = Select;
type TagRender = SelectProps["tagRender"];
interface InvoiceFormValues extends Omit<IInvoiceDetail, "tags"> {
    tags: number[];
}

const InvoiceDrawer = ({
    open,
    onClose,
    invoiceDetail,
    isLoading,
    onUpdateInvoiceDetail,
    onCreateNewInvoice,
    tags_data = [],
    isLoadingTags,
    isDefaultFixed,
}: InvoiceDrawerProps) => {
    const [form] = Form.useForm();
    const isEdit = Boolean(invoiceDetail && invoiceDetail.id);
    const selectedTagIds = Form.useWatch("tags", form) || [];
    const hasBudgetSelected = tags_data.some((tag) => selectedTagIds.includes(tag.id) && tag.is_budget);

    const tagOptions = tags_data.map((tag) => ({
        label: tag.name,
        value: tag.id,
        disabled: tag.is_budget && hasBudgetSelected && !selectedTagIds.includes(tag.id),
    }));

    const tags = tags_data.map((tag) => ({
        ...tag,
        value: tag.id,
        label: tag.name,
    }));

    useEffect(() => {
        if (open && invoiceDetail) {
            const init = {
                ...invoiceDetail,
                value: typeof invoiceDetail.value === "number" ? Math.round(invoiceDetail.value * 100) : 0,
                date: invoiceDetail.date ? dayjs(invoiceDetail.date) : undefined,
                next_payment: invoiceDetail.next_payment ? dayjs(invoiceDetail.next_payment) : undefined,
                tags: invoiceDetail.tags.map((tag) => tag.id),
            };

            form.setFieldsValue(init);
        } else if (open) {
            const init = {
                value: 0,
                date: dayjs(),
                next_payment: dayjs(),
                installments: 1,
                name: "",
                id: 0,
                tags: [],
                value_closed: 0,
                value_open: 0,
                status: 0,
                active: true,
                fixed: isDefaultFixed ?? false,
            };

            form.setFieldsValue(init);
        } else {
            form.resetFields();
        }
    }, [form, open, invoiceDetail, isDefaultFixed]);

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

    const onFinish = (values: InvoiceFormValues) => {
        console.log(values);
        const selectedTags = tags.filter((tag) => values.tags.includes(tag.id));
        const payload = {
            ...values,
            value: Number((values.value / 100).toFixed(2)),
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,
            next_payment: values.next_payment ? dayjs(values.next_payment).format("YYYY-MM-DD") : null,
            tags: selectedTags,
        };

        if (isEdit) {
            onUpdateInvoiceDetail(payload);
        } else {
            onCreateNewInvoice(payload);
        }

        onClose();
    };

    const handleSubmitForm = () => {
        form.submit();
    };

    const tagRender: TagRender = (props) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const color = tags.find((tag) => tag.id === value)?.color || "blue";
        return (
            <Tag
                color={color}
                onMouseDown={onPreventMouseDown}
                closable={closable}
                onClose={onClose}
                style={{ marginInlineEnd: 4 }}
            >
                {label}
            </Tag>
        );
    };

    return (
        <Drawer
            title={invoiceDetail ? `Nota #${invoiceDetail.id}` : "Nova nota"}
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
            <Form form={form} name="invoice" layout="vertical" variant="underlined" onFinish={onFinish}>
                <Form.Item name="id" label="ID" hidden>
                    <Input disabled />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Nome"
                            rules={[{ required: true, message: "Por favor digite um nome para a nota" }]}
                        >
                            <Input placeholder="Entre com o nome da nota" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="status" label="Status">
                            <Select disabled>
                                <Option value={0}>Em aberto</Option>
                                <Option value={1}>Baixado</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Dia de lançamento"
                            rules={[{ required: true, message: "Selecione a data da nota" }]}
                        >
                            <DatePicker
                                placeholder="Selecione a data"
                                style={{ width: "100%" }}
                                format={"DD/MM/YYYY"}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="next_payment"
                            label="Dia de pagamento"
                            rules={[{ required: true, message: "Selecione a data do pagamento" }]}
                        >
                            <DatePicker
                                placeholder="Selecione a data de pagamento"
                                style={{ width: "100%" }}
                                format={"DD/MM/YYYY"}
                                disabled={isEdit}
                            />
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
                            <InputNumber step={1} precision={0} style={{ width: "100%" }} disabled={isEdit} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="value"
                            label="Valor"
                            rules={[
                                { required: true, message: "Digite um valor" },
                                {
                                    type: "number",
                                    min: 1,
                                    message: "O valor deve ser maior que zero",
                                },
                            ]}
                        >
                            <InputNumber
                                step={1}
                                precision={0}
                                formatter={formatter}
                                parser={parser}
                                style={{ width: "100%" }}
                                disabled={isEdit}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="tags"
                            label="Etiquetas"
                            rules={[
                                { required: true, message: "Selecione ao menos uma etiqueta" },
                                {
                                    validator: (_, value: number[]) => {
                                        const selectedTags = tags.filter((tag) => value?.includes(tag.id));
                                        const hasBudget = selectedTags.some((tag) => tag.is_budget);

                                        if (!hasBudget) {
                                            return Promise.reject(
                                                new Error("Selecione ao menos uma etiqueta orçamentária"),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Etiquetas"
                                loading={isLoadingTags}
                                tagRender={tagRender}
                                options={tagOptions}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="fixed" label="Fixo">
                            <Switch disabled={isDefaultFixed !== undefined} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="active" label="Ativo">
                            <Switch disabled={!isEdit} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            {isEdit && invoiceDetail && (
                <InvoicePayments invoiceData={invoiceDetail} page={1} page_size={20} status="all" />
            )}
        </Drawer>
    );
};

export default InvoiceDrawer;
