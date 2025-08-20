"use client";
import { Button, Form, FormInstance, Input } from "antd";

import { INewUser } from "@/services/auth";

export interface ISignupFormProps {
    loading: boolean;
    form: FormInstance<INewUser>;
    onFinish: (values: INewUser) => void;
    onFinishFailed: (errorInfo: any) => void;
}

const SingupForm = ({ loading, form, onFinish, onFinishFailed }: ISignupFormProps) => {
    return (
        <Form
            form={form}
            layout="horizontal"
            name="register-form"
            labelCol={{ span: 8 }}
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
        >
            <Form.Item
                label="Nome"
                name="name"
                rules={[
                    { required: true, message: "Por favor insira seu nome!" },
                    { type: "string", max: 100, message: "O nome deve ter no máximo 100 caracteres!" },
                ]}
            >
                <Input data-testid="form-name" />
            </Form.Item>
            <Form.Item
                label="Sobrenome"
                name="last_name"
                rules={[
                    { required: true, message: "Por favor insira seu sobrenome!" },
                    { type: "string", max: 100, message: "O sobrenome deve ter no máximo 100 caracteres!" },
                ]}
            >
                <Input data-testid="form-last-name" />
            </Form.Item>
            <Form.Item
                label="Usuario"
                name="username"
                rules={[
                    {
                        required: true,
                        message: "Por favor insira seu usuário!",
                    },
                    { type: "string", max: 100, message: "O usuário deve ter no máximo 100 caracteres!" },
                ]}
            >
                <Input data-testid="form-username" />
            </Form.Item>
            <Form.Item
                label="E-mail"
                name="email"
                rules={[
                    { required: true, message: "Por favor insira seu e-mail!" },
                    {
                        type: "email",
                        message: "Por favor verifique seu e-mail",
                    },
                ]}
            >
                <Input data-testid="form-email" />
            </Form.Item>
            <Form.Item
                label="Senha"
                name="password"
                rules={[
                    { required: true, message: "Por favor insira sua senha!" },
                    { type: "string", min: 8, message: "A senha deve ter no mínimo 8 caracteres!" },
                ]}
                hasFeedback
            >
                <Input.Password data-testid="form-password" />
            </Form.Item>
            <Form.Item
                label="Confirme senha"
                name="confirm"
                dependencies={["password"]}
                hasFeedback
                rules={[
                    {
                        required: true,
                        message: "Por favor confirme sua senha!",
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error("As duas senhas que você digitou não correspondem!"));
                        },
                    }),
                ]}
            >
                <Input.Password data-testid="form-confirm" />
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
                Cadastrar
            </Button>
        </Form>
    );
};

export default SingupForm;
