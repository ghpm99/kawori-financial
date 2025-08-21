import { useState } from 'react';
import signinImg from '../../assets/signin.jpg';
import signupImg from '../../assets/signup.jpg';
import styles from './auth.module.scss';
import SigninForm from './signinForm';
import SignupForm from './signupForm';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [fade, setFade] = useState(false);

    const handleToggle = () => {
        // Primeiro fade out
        setFade(true);
        setTimeout(() => {
            setIsLogin(!isLogin);
            setFade(false);
        }, 300); // tempo do fade out
    };

    return (
        <div className={styles.container}>
            <div className={`${styles.authBox} ${isLogin ? 'loginState' : 'registerState'}`}>
                {/* Imagem */}
                <div
                    className={styles.imageSide}
                    style={{ backgroundImage: `url(${isLogin ? signinImg : signupImg})` }}
                ></div>

                {/* Formulário com fade + scale */}
                <div className={`${styles.formWrapper} ${fade ? styles.fade : ''}`}>
                    {isLogin ? <SigninForm /> : <SignupForm />}
                </div>

                {/* Toggle */}
                <button className={styles.toggleButton} onClick={handleToggle}>
                    {isLogin ? 'Criar Conta' : 'Entrar'}
                </button>
            </div>
        </div>
    );
};

export default AuthPage;
