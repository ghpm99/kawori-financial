"use client";

import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input } from "antd";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth";

import styles from "./signin.module.scss";

interface SigninFormValues {
    username: string;
    password: string;
    remember: boolean;
}
const SigninPage = () => {
    const [form] = Form.useForm();
    const { signIn, isAuthenticated, loading, errorMessage } = useAuth();
    const navigate = useRouter();

    if (isAuthenticated) {
        navigate.push("/internal/financial/overview");
    }
    const onFinish = (values: SigninFormValues) => {
        signIn(values);
    };
    return (
        <div className={styles.container}>
            <Card className={styles.card} bordered={false}>
                <h1 className={styles.title}>Entrar</h1>
                <Form form={form} name="login" layout="vertical" onFinish={onFinish} requiredMark={false}>
                    {errorMessage && <Alert message={errorMessage} type="error" />}
                    <Form.Item name="username" rules={[{ required: true, message: "Digite seu usuário" }]}>
                        <Input prefix={<UserOutlined />} placeholder="Usuário" size="large" />
                    </Form.Item>

                    <Form.Item name="password" rules={[{ required: true, message: "Digite sua senha" }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Senha" size="large" />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            className={styles.loginButton}
                            loading={loading}
                        >
                            Entrar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default SigninPage;
