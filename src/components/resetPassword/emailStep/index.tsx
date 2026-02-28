import { MailOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";

interface EmailStepProps {
    onSuccess: (email: string) => void;
    errorMessage?: string;
    isLoading: boolean;
}

const EmailStep = ({ onSuccess, errorMessage, isLoading }: EmailStepProps) => {
    const [form] = Form.useForm<{ email: string }>();

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => onSuccess(values.email)}
                requiredMark={false}
            >
                {errorMessage && <Alert type="error" message={errorMessage} style={{ marginBottom: 16 }} />}
                <Form.Item
                    name="email"
                    rules={[{ type: "email", required: true, message: "Digite um e-mail válido" }]}
                >
                    <Input prefix={<MailOutlined />} placeholder="E-mail" size="large" type="email" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                        Enviar link de redefinição
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default EmailStep;
