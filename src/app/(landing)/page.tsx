"use client";

import { useEffect } from "react";

import { ArrowRightOutlined, DashboardOutlined, PieChartOutlined, WalletOutlined } from "@ant-design/icons";
import * as Sentry from "@sentry/nextjs";
import { Button, Divider, message } from "antd";
import { useForm } from "antd/lib/form/Form";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signinThunk } from "@/lib/features/auth";
import { fetchNewsFeedThunk } from "@/lib/features/news";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { INewUser, signupService } from "@/services/auth";
import { formatterDate } from "@/util";
import LogoKawori from "assets/kaori_logo6.png";

import Facetexture from "@/components/landing/facetexture";
import FAQ from "@/components/landing/FAQ";
import News from "@/components/landing/news";
import UserPanel from "@/components/landing/userPanel";
import Welcome from "@/components/landing/welcome";
import { ILoginPageProps } from "@/components/signin";
import { ISignupFormProps } from "@/components/signup";
import { useTheme } from "@/components/themeProvider/themeContext";

import styles from "./Home.module.scss";

export default function Home() {
    const [form] = useForm();
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { status, user } = useAppSelector((state) => state.auth);
    const { data: newsData, status: newsStatus } = useAppSelector((state) => state.news);
    const loadingStore = useAppSelector((state) => state.loading);
    const { state } = useTheme();
    const { theme } = state;

    const signinStatus = loadingStore.effects["auth/signin"];

    useEffect(() => {
        document.title = "Kawori";
        dispatch(fetchNewsFeedThunk());
    }, []);

    const handleSignout = () => {
        router.push("/signout");
    };

    const onFinishLogin = (values: any) => {
        if (signinStatus === "pending") return;
        dispatch(
            signinThunk({
                username: values.username,
                password: values.password,
                remember: values.remember,
            }),
        );
    };

    const onFinishFailedLogin = (errorInfo: any) => {
        Sentry.captureException(errorInfo);
        console.error("Failed:", errorInfo);
    };

    const onFinishSignup = (values: INewUser) => {
        signupService(values)
            .then((response) => {
                message.success(response.data.msg);
                form.resetFields();
                onFinishLogin({ username: values.username, password: values.password, remember: true });
            })
            .catch((error) => {
                Sentry.captureException(error);
                message.error(error?.response?.data?.msg ?? "Falhou em criar usuário");
            });
    };
    const onFinishFailedSignup = (errorInfo) => {
        Sentry.captureException(errorInfo);
        console.error("Failed:", errorInfo);
    };

    const loadingSigninOrSignup = ((): boolean => {
        const signinLoading = loadingStore.effects["auth/signin"] === "pending";
        const signupLoading = loadingStore.effects["auth/signup"] === "pending";
        const verifyTokenLoading = loadingStore.effects["auth/verify"] === "pending";
        const refreshTokenLoading = loadingStore.effects["auth/refresh"] === "pending";
        return signinLoading || signupLoading || verifyTokenLoading || refreshTokenLoading;
    })();

    const loginProps: ILoginPageProps = {
        loading: loadingSigninOrSignup,
        hasError: signinStatus === "failed",
        onFinish: onFinishLogin,
        onFinishFailed: onFinishFailedLogin,
    };

    const signupProps: ISignupFormProps = {
        loading: loadingSigninOrSignup,
        form: form,
        onFinish: onFinishSignup,
        onFinishFailed: onFinishFailedSignup,
    };

    return (
        <>
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.heroTitle}>
                        Gerencie suas finanças com
                        <span className={styles.heroHighlight}> inteligência</span>
                    </h1>
                    <p className={styles.heroDescription}>
                        Kawori Financial é sua plataforma completa para controle financeiro pessoal. Monitore gastos,
                        planeje orçamentos e alcance seus objetivos financeiros.
                    </p>
                    <div className={styles.heroActions}>
                        <Link href="/financial/dashboard">
                            <Button
                                type="primary"
                                size="large"
                                icon={<DashboardOutlined />}
                                className={styles.ctaButton}
                            >
                                Acessar Dashboard
                                <ArrowRightOutlined />
                            </Button>
                        </Link>
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

    return (
        <>
            <div className={styles["section"]}>
                <Image
                    alt="Kawori Logo"
                    src={LogoKawori}
                    className={`${styles["logo-image"]} ${styles[theme]}`}
                    width={500}
                />
                <UserPanel
                    loading={loadingStore.effects["profile/userDetail"] !== "idle"}
                    status={status}
                    user={user}
                    formatDate={formatterDate}
                    handleSignout={handleSignout}
                    loginPage={loginProps}
                    signupPage={signupProps}
                />
            </div>
            <Divider />
            <News data={newsData} status={newsStatus} />
            <Divider />
            <Welcome />
            <Facetexture theme={theme} />
            <Divider />
            <FAQ />
            <Divider />
        </>
    );
}
