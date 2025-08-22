import { useState } from 'react';
import signinImg from '../../assets/signin.jpg';
import signupImg from '../../assets/signup.jpg';
import styles from './auth.module.scss';
import SigninForm from './signinForm';
import SignupForm from './signupForm';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [fading, setFading] = useState(false);

    const handleToggle = () => {
        setFading(true);
        setTimeout(() => {
            setIsLogin((prev) => !prev);
            setFading(false);
        }, 300);
    };
    return (
        <div className={styles.container}>
            <div
                className={`${styles.authBox} ${isLogin ? styles['signinState'] : styles['signupState']}`}
            >
                {/* Imagem */}
                <div
                    className={`${styles.imageSide} ${fading ? styles.imageFade : ''} ${styles['signinImage']}`}
                    style={{ backgroundImage: `url(${signinImg})` }}
                />
                <div
                    className={`${styles.imageSide} ${fading ? styles.imageFade : ''} ${styles['signupImage']}`}
                    style={{ backgroundImage: `url(${signupImg})` }}
                />

                {/* Formulário com fade */}
                <div className={`${styles.formWrapper} ${fading ? styles.formFade : ''}`}>
                    {isLogin ? <SigninForm /> : <SignupForm />}
                </div>

                <button className={styles.toggleBtn} onClick={handleToggle}>
                    {isLogin ? 'Cadastrar' : 'Entrar'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
