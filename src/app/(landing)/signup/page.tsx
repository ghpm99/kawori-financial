"use client";

import { useEffect } from "react";

import { Button, Card, ConfigProvider, Form, Input } from "antd";
import { createStyles } from "antd-style";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth";

import styles from "./signup.module.scss";

const useStyle = createStyles(({ prefixCls, css }) => ({
    linearGradientButton: css`
        &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
            > span {
                position: relative;
            }

            &::before {
                content: "";
                background: linear-gradient(135deg, #667eea 0%, #081550 100%);
                position: absolute;
                inset: -1px;
                opacity: 1;
                transition: all 0.3s;
                border-radius: inherit;
            }

            &:hover::before {
                opacity: 0;
            }
        }
    `,
}));

const SignupPage = () => {
    const { styles: antdStyle } = useStyle();
    const [form] = Form.useForm();
    const { signUp, isAuthenticated } = useAuth();
    const navigate = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            navigate.push("/internal/financial");
        }
    }, [isAuthenticated, navigate]);

    return (
        <ConfigProvider
            button={{
                className: antdStyle.linearGradientButton,
            }}
        >
            <div className={styles.container}>
                <Card className={styles.card} bordered={false}>
                    <h1 className={styles.title}>Cadastrar</h1>
                    <Form
                        labelCol={{ span: 8 }}
                        // wrapperCol={{ span: 14 }}
                        form={form}
                        name="login"
                        layout="horizontal"
                        onFinish={signUp}
                        requiredMark={false}
                    >
                        <Form.Item label="Usuario" name="username" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Sobrenome" name="last_name" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Senha" name="password" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>
                        <Form.Item label="Confirmar Senha" name="password-confirmation" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>

                        <Form.Item>
                            <Button block type="primary" htmlType="submit">
                                Cadastrar
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </ConfigProvider>
    );
};

export default SignupPage;
