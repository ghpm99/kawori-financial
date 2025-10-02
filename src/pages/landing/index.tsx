import {
    ArrowRightOutlined,
    DashboardOutlined,
    PieChartOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { NavLink } from 'react-router-dom';
import styles from './landing.module.scss';

const LandingPage = () => {
    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Gerencie suas finanças com
                        <span className={styles.heroHighlight}> inteligência</span>
                    </h1>
                    <p className={styles.heroDescription}>
                        Kawori Financial é sua plataforma completa para controle financeiro pessoal.
                        Monitore gastos, planeje orçamentos e alcance seus objetivos financeiros.
                    </p>
                    <div className={styles.heroActions}>
                        <NavLink to="/financial/dashboard">
                            <Button
                                type="primary"
                                size="large"
                                icon={<DashboardOutlined />}
                                className={styles.ctaButton}
                            >
                                Acessar Dashboard
                                <ArrowRightOutlined />
                            </Button>
                        </NavLink>
                    </div>
                </div>
                <div className={styles.heroVisual}>
                    <div className={styles.heroCard}>
                        <div className={styles.cardHeader}>
                            <PieChartOutlined className={styles.cardIcon} />
                            <span>Resumo Financeiro</span>
                        </div>
                        <div className={styles.cardContent}>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Receita</span>
                                <span className={styles.metricValue}>R$ 5.240</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Gastos</span>
                                <span className={styles.metricValue}>R$ 3.180</span>
                            </div>
                            <div className={styles.metric}>
                                <span className={styles.metricLabel}>Economia</span>
                                <span className={styles.metricValue}>R$ 2.060</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className={styles.features}>
                <div className={styles.featuresContent}>
                    <h2 className={styles.featuresTitle}>Recursos Principais</h2>
                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <DashboardOutlined className={styles.featureIcon} />
                            <h3>Dashboard Intuitivo</h3>
                            <p>Visualize todas suas informações financeiras em um só lugar</p>
                        </div>
                        <div className={styles.featureCard}>
                            <PieChartOutlined className={styles.featureIcon} />
                            <h3>Controle de Orçamento</h3>
                            <p>Defina metas e acompanhe seus gastos por categoria</p>
                        </div>
                        <div className={styles.featureCard}>
                            <WalletOutlined className={styles.featureIcon} />
                            <h3>Diário Financeiro</h3>
                            <p>Registre e categorize todas suas transações</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default LandingPage;
