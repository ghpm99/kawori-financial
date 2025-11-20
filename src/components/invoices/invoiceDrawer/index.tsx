import { useEffect, useState } from "react";

import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Form,
    Input,
    InputNumber,
    Row,
    Select,
    Space,
    Switch,
    Tag,
    Typography,
} from "antd";
import type { SelectProps } from "antd";
import dayjs from "dayjs";

interface InvoiceDrawerProps {
    open: boolean;
    onClose: () => void;
    invoiceDetail?: IInvoiceDetail;
    isLoading?: boolean;
    onUpdateInvoiceDetail: (values: IInvoiceDetail) => void;
    tags_data: ITags[];
    isLoadingTags: boolean;
}

const { Paragraph } = Typography;
const { Option } = Select;
type TagRender = SelectProps["tagRender"];

const InvoiceDrawer = ({
    open,
    onClose,
    invoiceDetail,
    isLoading,
    onUpdateInvoiceDetail,
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

    const [tagSelection, setTagSelection] = useState<ITags[]>([]);
    console.log("tagSelection", tagSelection);

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
                payment_date: invoiceDetail.next_payment ? dayjs(invoiceDetail.next_payment) : undefined,
                tags: invoiceDetail.tags.map((tag) => tag.name),
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

    const parser = (value: string): number => {
        if (!value) return 0;
        const digits = String(value).replace(/\D+/g, "");
        if (!digits) return 0;
        return Number(digits);
    };

    const onSaveEditTagDetail = (values: IInvoiceDetail) => {
        const payload = {
            ...values,
            value: typeof values.value === "number" ? Number((values.value / 100).toFixed(2)) : 0,
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,
        };
        onUpdateInvoiceDetail(payload);
    };

    const onSaveNewTagDetail = (values: IInvoiceDetail) => {
        const payload = {
            ...values,
            value: typeof values.value === "number" ? Number((values.value / 100).toFixed(2)) : 0,
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,
            tags: tagSelection,
        };
        onUpdateInvoiceDetail(payload);
    };

    const onFinish = (values: IInvoiceDetail) => {
        if (!isEdit) {
            console.log(values);
            console.log(tagSelection);

            return;
        }
        const payload = {
            ...values,
            value: typeof values.value === "number" ? Number((values.value / 100).toFixed(2)) : 0,
            date: values.date ? dayjs(values.date).format("YYYY-MM-DD") : null,
        };
        onClose();
        onUpdateInvoiceDetail(payload);
    };

    const handleSubmitForm = () => {
        form.submit();
    };

    const handleChangeTags = (value) => {
        console.log(value);
        const tagsList = value.map((tagId) => {
            return tags.find((tag) => tag.name === tagId)!;
        });
        setTagSelection(tagsList);
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
            <Form
                form={form}
                name="invoice"
                layout="vertical"
                hideRequiredMark
                variant="underlined"
                onFinish={onFinish}
            >
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
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="date"
                            label="Dia de lançamento"
                            rules={[{ required: true, message: "Selecione a data da nota" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} disabled={isEdit} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="payment_date"
                            label="Dia de pagamento"
                            rules={[{ required: true, message: "Selecione a data do pagamento" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format={"DD/MM/YYYY"} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item name="status" label="Status">
                            <Select defaultValue={0} placeholder="Please select an owner" disabled>
                                <Option value={0}>Em aberto</Option>
                                <Option value={1}>Baixado</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="type"
                            label="Tipo"
                            rules={[{ required: true, message: "Selecione o tipo de entrada" }]}
                        >
                            <Select placeholder="Selecione o tipo de entrada">
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
                            <InputNumber defaultValue={1} step={1} precision={0} style={{ width: "100%" }} />
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
                    <Col span={24}>
                        <Form.Item label="Tags" name="tags">
                            <Select
                                mode="multiple"
                                style={{ width: "100%" }}
                                placeholder="Tags"
                                loading={isLoadingTags}
                                onChange={handleChangeTags}
                                value={tagSelection}
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
                            <Switch />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default InvoiceDrawer;
