import { useEffect, useState } from "react";

import type { SelectProps } from "antd";
import { Button, Col, DatePicker, Drawer, Form, Input, InputNumber, Row, Select, Space, Switch, Tag } from "antd";
import dayjs from "dayjs";

import { InvoicePayments } from "../payments";
import { ITags } from "@/components/providers/tags";
import { IInvoiceDetail } from "@/components/providers/invoices";

interface InvoiceDrawerProps {
    open: boolean;
    onClose: () => void;
    invoiceDetail?: IInvoiceDetail;
    isLoading?: boolean;
    onUpdateInvoiceDetail: (values: IInvoiceDetail) => void;
    onCreateNewInvoice: (values: IInvoiceDetail) => void;
    tags_data: ITags[];
    isLoadingTags: boolean;
}

const { Option } = Select;
type TagRender = SelectProps["tagRender"];

const InvoiceDrawer = ({
    open,
    onClose,
    invoiceDetail,
    isLoading,
    onUpdateInvoiceDetail,
    onCreateNewInvoice,
    tags_data = [],
    isLoadingTags,
}: InvoiceDrawerProps) => {
    const [form] = Form.useForm();
    const isEdit = Boolean(invoiceDetail && invoiceDetail.id);

    const tags = tags_data.map((tag) => ({
        ...tag,
        value: tag.name,
        label: tag.name,
    }));

    const [tagSelection, setTagSelection] = useState<ITags[]>(invoiceDetail?.tags || []);

    const hasAlreadySelectedBudget =
        tags.filter((tag) => tagSelection.map((tag) => tag.name).includes(tag.name) && tag.is_budget).length > 0;

    const tagsOptions = tags
        .filter((tag) => !tagSelection.map((tag) => tag.name).includes(tag.name))
        .map((tag) => ({
            ...tag,
            disabled: tag.is_budget && hasAlreadySelectedBudget,
        }));

    useEffect(() => {
        if (open && invoiceDetail) {
            const init = {
                ...invoiceDetail,
                value: typeof invoiceDetail.value === "number" ? Math.round(invoiceDetail.value * 100) : 0,
                date: invoiceDetail.date ? dayjs(invoiceDetail.date) : undefined,
                next_payment: invoiceDetail.next_payment ? dayjs(invoiceDetail.next_payment) : undefined,
                tags: invoiceDetail.tags.map((tag) => tag.name),
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
            };

            form.setFieldsValue(init);
        } else {
            form.resetFields();
        }
    }, [form, open, invoiceDetail]);

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

    const onSaveEditInvoice = (values: IInvoiceDetail) => {
        const payload = {
            ...values,
            value: typeof values.value === "number" ? Number((values.value / 100).toFixed(2)) : 0,
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,
            next_payment: values.next_payment ? dayjs(values.next_payment).format("YYYY-MM-DD") : null,
        } as IInvoiceDetail;
        onUpdateInvoiceDetail(payload);
    };

    const onSaveNewInvoice = (values: IInvoiceDetail) => {
        const payload = {
            ...values,
            value: typeof values.value === "number" ? Number((values.value / 100).toFixed(2)) : 0,
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,
            next_payment: values.next_payment ? dayjs(values.next_payment).format("YYYY-MM-DD") : null,
            tags: tagSelection,
        } as IInvoiceDetail;
        onCreateNewInvoice(payload);
    };

    const onFinish = (values: IInvoiceDetail) => {
        if (isEdit) {
            onSaveEditInvoice(values);
        } else {
            onSaveNewInvoice(values);
        }
        onClose();
    };

    const handleSubmitForm = () => {
        form.submit();
    };

    const handleChangeTags = (values: string[]) => {
        setTagSelection(tags.filter((tag) => values.includes(tag.name)));
    };

    const tagRender: TagRender = (props) => {
        const { label, value, closable, onClose } = props;
        const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
            event.preventDefault();
            event.stopPropagation();
        };
        const color = tags.find((tag) => tag.name === value)?.color || "blue";
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
                            label="Etiquetas"
                            name="tags"
                            rules={[
                                { required: true, message: "Selecione ao menos uma etiqueta" },
                                {
                                    validator: () => {
                                        if (!hasAlreadySelectedBudget) {
                                            return Promise.reject(
                                                new Error("Selecione ao menos uma etiqueta orcamentaria"),
                                            );
                                        }
                                        return Promise.resolve();
                                    },
                                },
                            ]}
                        >
                            <Select
                                mode="multiple"
                                style={{ width: "100%" }}
                                placeholder="Etiquetas"
                                data-testid="invoice-tags"
                                loading={isLoadingTags}
                                onChange={handleChangeTags}
                                value={tagSelection.map((tag) => tag.name)}
                                tagRender={tagRender}
                                options={tagsOptions?.map((item) => ({
                                    value: item.name,
                                    label: item.name,
                                    disabled: item.disabled,
                                }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="fixed" label="Fixo">
                            <Switch />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="active" label="Ativo">
                            <Switch disabled={!isEdit} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            {isEdit && invoiceDetail && <InvoicePayments invoice={invoiceDetail} />}
        </Drawer>
    );
};

export default InvoiceDrawer;
