import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input } from 'antd';
import styles from './signin.module.scss';
import { useMutation } from '@tanstack/react-query';
import { signinService, type ISigninArgs, type ISigninResponse } from '@/services/auth';
import { LOCAL_STORE_ITEM_NAME } from '@/components/constants';
import type { AxiosResponse } from 'axios';

interface SigninFormValues {
    username: string;
    password: string;
    remember: boolean;
}
const SigninPage = () => {
    const [form] = Form.useForm();

    const { mutate } = useMutation<AxiosResponse<ISigninResponse, any>, Error, ISigninArgs>({
        mutationFn: signinService,
        onSuccess: ({ data }) => {
            localStorage.setItem(LOCAL_STORE_ITEM_NAME, data.refresh_token_expiration);
        },
        onError: (error) => {
            console.error('Login error:', error);
        },
    });

    const onFinish = (values: SigninFormValues) => {
        mutate(values);
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
