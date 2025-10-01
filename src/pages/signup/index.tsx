import { Button, Card, Form, Input } from 'antd';
import styles from './signup.module.scss';
import { LockOutlined, UserOutlined, WalletOutlined } from '@ant-design/icons';
import { NavLink } from 'react-router-dom';

const SignupPage = () => {
    const [form] = Form.useForm();

    const onFinish = (values: any) => {
        console.log('Cadastro values:', values);
        // aqui você chamaria sua API de autenticação
    };
    return (
        <div className={styles.container}>
            <nav className={styles.nav}>
                <div className={styles.navContent}>
                    <div className={styles.logo}>
                        <WalletOutlined className={styles.logoIcon} />
                        <span className={styles.logoText}>Kawori Financial</span>
                    </div>
                    <div className={styles.navLinks}>
                        <NavLink to="/signin" className={styles.navLink}>
                            Logar
                        </NavLink>
                        <NavLink to="/signup" className={styles.navLink}>
                            Cadastrar
                        </NavLink>
                    </div>
                </div>
            </nav>
            <Card className={styles.card} bordered={false}>
                <h1 className={styles.title}>Cadastrar</h1>
                <Form
                    form={form}
                    name="login"
                    layout="horizontal"
                    onFinish={onFinish}
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

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Cadastrar
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>
                        <WalletOutlined />
                        <span>Kawori Financial</span>
                    </div>
                    <p className={styles.footerText}>
                        © 2024 Kawori Financial. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default SignupPage;
