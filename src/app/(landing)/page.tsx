"use client";

import { Divider, message } from "antd";
import LogoKawori from "assets/kaori_logo6.png";

import Image from "next/image";
import styles from "./Home.module.scss";

import Facetexture from "@/components/landing/facetexture";
import FAQ from "@/components/landing/FAQ";
import News from "@/components/landing/news";
import UserPanel from "@/components/landing/userPanel";
import Welcome from "@/components/landing/welcome";
import { ILoginPageProps } from "@/components/signin";
import { ISignupFormProps } from "@/components/signup";
import { useTheme } from "@/components/themeProvider/themeContext";
import { signinThunk } from "@/lib/features/auth";
import { fetchNewsFeedThunk } from "@/lib/features/news";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { INewUser, signupService } from "@/services/auth";
import { formatterDate } from "@/util";
import * as Sentry from "@sentry/nextjs";
import { useForm } from "antd/lib/form/Form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
