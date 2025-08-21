import { Button, Card, Form, Input } from 'antd';
import styles from './signin.module.scss';
import { LockOutlined, UserOutlined } from '@ant-design/icons';

const SigninPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Login values:', values);
        // aqui você chamaria sua API de autenticação
    };
    return (
        <div className={styles.container}>
            <Card className={styles.card} bordered={false}>
                <h1 className={styles.title}>Login</h1>
                <Form
                    form={form}
                    name="login"
                    layout="vertical"
                    onFinish={onFinish}
                    requiredMark={false}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Digite seu usuário' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Usuário" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Digite sua senha' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Senha"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            className={styles.loginButton}
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
