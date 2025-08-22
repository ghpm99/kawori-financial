// LoginForm.tsx
import { Form, Input, Button } from 'antd';

const SigninForm = () => {
    const onFinish = (values: any) => console.log('Login:', values);

    return (
        <Form layout="vertical" onFinish={onFinish}>
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
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Entrar
                </Button>
            </Form.Item>
        </Form>
    );
};

export default SigninForm;
