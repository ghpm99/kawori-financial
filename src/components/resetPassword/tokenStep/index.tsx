import { KeyOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";

interface TokenStepProps {
    onSuccess: (token: string) => void;
    errorMessage?: string;
    isLoading: boolean;
}

const TokenStep = ({ onSuccess, errorMessage, isLoading }: TokenStepProps) => {
    const [form] = Form.useForm<{ token: string }>();

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => onSuccess(values.token)}
                requiredMark={false}
            >
                {errorMessage && <Alert type="error" message={errorMessage} style={{ marginBottom: 16 }} />}
                <Form.Item name="token" rules={[{ required: true, message: "Digite o token recebido por e-mail" }]}>
                    <Input
                        prefix={<KeyOutlined />}
                        placeholder="Cole o token recebido por e-mail"
                        size="large"
                    />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                        Validar token
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default TokenStep;
