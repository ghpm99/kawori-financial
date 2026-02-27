import { Alert, Button, Form, Input } from "antd";

interface NewPasswordStepProps {
    onSuccess: (newPassword: string) => void;
    errorMessage?: string | string[];
    isLoading: boolean;
}

const NewPasswordStep = ({ onSuccess, errorMessage, isLoading }: NewPasswordStepProps) => {
    const [form] = Form.useForm<{ new_password: string; confirm_password: string }>();

    const renderError = () => {
        if (!errorMessage) return null;
        if (Array.isArray(errorMessage)) {
            return (
                <ul style={{ paddingLeft: 20, marginBottom: 16 }}>
                    {errorMessage.map((msg, i) => (
                        <li key={i}>{msg}</li>
                    ))}
                </ul>
            );
        }
        return <Alert type="error" message={errorMessage} style={{ marginBottom: 16 }} />;
    };

    return (
        <>
            <Form
                form={form}
                layout="vertical"
                onFinish={(values) => onSuccess(values.new_password)}
                requiredMark={false}
            >
                {renderError()}
                <Form.Item
                    name="new_password"
                    rules={[{ required: true, message: "Digite a nova senha" }]}
                >
                    <Input.Password placeholder="Nova senha" size="large" />
                </Form.Item>
                <Form.Item
                    name="confirm_password"
                    dependencies={["new_password"]}
                    rules={[
                        { required: true, message: "Confirme a nova senha" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue("new_password") === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("As senhas não coincidem"));
                            },
                        }),
                    ]}
                >
                    <Input.Password placeholder="Confirmar nova senha" size="large" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" size="large" block loading={isLoading}>
                        Redefinir senha
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default NewPasswordStep;
