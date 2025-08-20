import { Button, Checkbox, Form, Input } from "antd";

import styles from "./Signin.module.scss";

export interface ILoginPageProps {
    loading: boolean;
    hasError: boolean;
    onFinish: (values: any) => void;
    onFinishFailed: (errorInfo: any) => void;
}
export default function LoginPage({ loading, hasError, onFinish, onFinishFailed }: ILoginPageProps) {
    return (
        <Form
            name="basic"
            style={{ maxWidth: 600 }}
            labelCol={{ span: 4 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            {hasError && <div className={styles["error"]}>Usuario ou senha incorretos</div>}

            <Form.Item
                label="Usuario"
                name="username"
                rules={[
                    {
                        required: true,
                        message: "Por favor insira seu usuario!",
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Senha"
                name="password"
                rules={[
                    {
                        required: true,
                        message: "Por favor insira sua senha!",
                    },
                ]}
            >
                <Input.Password />
            </Form.Item>

            <Form.Item>
                <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox>Lembrar-se de mim</Checkbox>
                </Form.Item>
                <a
                    href=""
                    style={{
                        float: "right",
                    }}
                >
                    Esqueci minha senha
                </a>
            </Form.Item>

            <Button
                style={{
                    float: "right",
                    width: "100%",
                }}
                type="primary"
                htmlType="submit"
                loading={loading}
            >
                Logar
            </Button>
        </Form>
    );
}
