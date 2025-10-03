import { WalletOutlined } from '@ant-design/icons';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './landingLayout.module.scss';

const LandingLayout = () => {
    return (
        <div className={styles.container}>
            {/* Navigation */}
            <nav className={styles.nav}>
                <div className={styles.navContent}>
                    <NavLink to="/" className={styles.logo}>
                        <WalletOutlined className={styles.logoIcon} />
                        <span className={styles.logoText}>Kawori Financial</span>
                    </NavLink>
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

            <div className={styles.content}>
                <Outlet />
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <div className={styles.footerContent}>
                    <div className={styles.footerLogo}>
                        <WalletOutlined />
                        <span>Kawori Financial</span>
                    </div>
                    <p className={styles.footerText}>
                        © 2025 Kawori Financial. Todos os direitos reservados.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingLayout;
