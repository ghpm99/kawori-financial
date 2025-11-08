import { useEffect } from "react";

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
    Typography,
} from "antd";
import dayjs from "dayjs";

interface TagDrawerProps {
    open: boolean;
    onClose: () => void;
    tagDetails?: ITag;
    isLoading?: boolean;
    onUpdateTagDetail: (values: ITag) => void;
}

const { Paragraph } = Typography;
const { Option } = Select;

const TagDrawer = ({ open, onClose, tagDetails, isLoading, onUpdateTagDetail }: TagDrawerProps) => {
    const [form] = Form.useForm();
    useEffect(() => {
        if (open && tagDetails) {
            form.setFieldsValue(tagDetails);
        } else {
            form.resetFields();
        }
    }, [form, open, tagDetails]);

    const onFinish = (values: any) => {
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
            <Form form={form} layout="vertical" hideRequiredMark variant="underlined" onFinish={onFinish}>
                <Row gutter={16}>
                    <Col span={12}>
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
