import { useAuth } from '@/providers/authProvider';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input } from 'antd';
import styles from './signin.module.scss';

interface SigninFormValues {
    username: string;
    password: string;
    remember: boolean;
}
const SigninPage = () => {
    const [form] = Form.useForm();
    const { signinMutate } = useAuth();

    const onFinish = (values: SigninFormValues) => {
        signinMutate(values);
    };
    return (
        <div className={styles.container}>
            <Card className={styles.card} bordered={false}>
                <div className={styles['form']}>
            <div className={styles['title']}>Acesse sua conta com e-mail ou nome de usuário</div>
            <div className={styles['sub-title']}>
                Não tem uma conta?{' '}
                <Link to='/signup' className={styles['link']}>
                    {' '}
                    Clique aqui para criar a sua
                </Link>
            </div>
            <Input
                id='username'
                name='username'
                autoComplete='username'
                placeholder='E-mail ou usuário'
                handleChange={context.changeValue}
                validated={false}
                value={context.username}
                error={{
                    show: context.errorLogin.length > 0,
                    // show: context.errorLogin.length > 0 && !context.errorLogin.includes('Captcha'),
                    message: '',
                }}
                autoFocus={true}
            />
            <InputPassword
                id='password'
                name='password'
                placeholder='Senha'
                handleChange={context.changeValue}
                value={context.password}
                validated={false}
                error={{
                    show: context.errorLogin.length > 0,
                    // show: context.errorLogin.length > 0 && !context.errorLogin.includes('Captcha'),
                    message: context.errorLogin,
                }}
            />

            {/* {context.errorLogin.includes('Captcha') && context.displayCaptchaError
                ? <p className={styles['error-alert']}>{context.errorLogin}</p>
                : <></>}

            <div className={context.errorLogin.includes('Captcha') && context.displayCaptchaError ? styles['error'] : ''}>
                <ReCAPTCHA
                    ref={context.captchaRef}
                    sitekey={context.captchaPublicKey}
                    hl="pt-BR"
                    onChange={context.clearCaptchaError}
                />
            </div> */}
            <div className={styles['input-container']}>
                <div className={styles['checkbox-container']}>
                    <Checkbox
                        id='remember'
                        onChange={context.changeRemember}
                        className={styles['checkbox']}
                        style={{ borderRadius: '4px' }}
                        checked={context.remember}
                    >
                        <div className={styles['checkbox-text']}>Mantenha-me conectado</div>
                    </Checkbox>
                    <Link to={'/identify'} className={`${styles['link']} ${styles['link-desktop']}`}>
                        Recuperar senha
                    </Link>
                </div>
            </div>
            <div className={styles['submit']}>
                <input
                    className={`${styles['submit-button']}`}
                    type={'submit'}
                    value='Entrar'
                    onClick={context.onSubmit}
                />
            </div>
            <Link to={'/identify'} className={`${styles['link']} ${styles['link-mobile']}`}>
                Recuperar senha
            </Link>
        </div>
        </div>
    );
};

export default SigninPage;
