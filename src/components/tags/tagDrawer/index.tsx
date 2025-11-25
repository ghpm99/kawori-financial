import { useEffect } from "react";

import { ITags } from "@/components/providers/tags";
import { Button, Col, Drawer, Form, Input, Row, Space } from "antd";

interface TagDrawerProps {
    open: boolean;
    onClose: () => void;
    tagDetails?: ITags;
    isLoading?: boolean;
    onUpdateTagDetail: (values: ITags) => void;
}

const TagDrawer = ({ open, onClose, tagDetails, isLoading, onUpdateTagDetail }: TagDrawerProps) => {
    const [form] = Form.useForm();
    useEffect(() => {
        if (open && tagDetails) {
            form.setFieldsValue(tagDetails);
        } else {
            form.resetFields();
        }
    }, [form, open, tagDetails]);

    const onFinish = (values: ITags) => {
        onClose();
        onUpdateTagDetail(values);
    };

    const handleSubmitForm = () => {
        form.submit();
    };
    return (
        <Drawer
            title={tagDetails ? `Tag #${tagDetails.id}` : "Nova Tag"}
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
                        <Form.Item label="Id" name="id" hidden>
                            <Input placeholder="Digite o nome" data-testid="tag-name" />
                        </Form.Item>
                        <Form.Item
                            label="Nome"
                            name="name"
                            rules={[{ required: true, message: "Entre com o nome da tag" }]}
                        >
                            <Input placeholder="Digite o nome" data-testid="tag-name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Cor" name="color">
                            <input type="color" data-testid="tag-color" />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default TagDrawer;
