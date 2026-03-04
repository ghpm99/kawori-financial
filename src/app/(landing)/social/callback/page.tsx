"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, Card, Result, Spin, Typography } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/components/providers/auth";

import styles from "./socialCallback.module.scss";

type CallbackStatus = "loading" | "success" | "error";
type CallbackMode = "login" | "link";

const SUCCESS_REDIRECT_DELAY_MS = 2000;

const sanitizeNextPath = (rawValue: string | null, fallbackPath: string) => {
    if (!rawValue) {
        return fallbackPath;
    }

    try {
        const parsedUrl = new URL(rawValue, window.location.origin);
        if (parsedUrl.origin !== window.location.origin) {
            return fallbackPath;
        }

        return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
        if (rawValue.startsWith("/") && !rawValue.startsWith("//")) {
            return rawValue;
        }

        return fallbackPath;
    }
};

const SocialCallbackPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isAuthenticated, refetchAuth } = useAuth();

    const [status, setStatus] = useState<CallbackStatus>("loading");
    const [title, setTitle] = useState("Concluindo autenticacao social...");
    const [subtitle, setSubtitle] = useState("Aguarde alguns segundos.");
    const [redirectTarget, setRedirectTarget] = useState("/internal/financial");

    const searchParamsKey = useMemo(() => searchParams.toString(), [searchParams]);

    useEffect(() => {
        let isMounted = true;
        let redirectTimer: ReturnType<typeof setTimeout> | null = null;

        const resolveCallback = async () => {
            const mode: CallbackMode = searchParams.get("mode") === "link" ? "link" : "login";
            const defaultTarget = mode === "link" ? "/internal/financial" : "/internal/financial";
            const nextPath = sanitizeNextPath(searchParams.get("next"), defaultTarget);
            const errorMessage = searchParams.get("error") || searchParams.get("detail") || searchParams.get("msg");
            const statusParam = (searchParams.get("status") || "").toLowerCase();
            const hasExplicitSuccessFlag =
                statusParam === "ok" ||
                statusParam === "success" ||
                searchParams.get("success") === "true" ||
                searchParams.get("linked") === "true";

            if (isMounted) {
                setRedirectTarget(nextPath);
            }

            if (errorMessage) {
                if (isMounted) {
                    setStatus("error");
                    setTitle("Nao foi possivel concluir a autenticacao social");
                    setSubtitle(errorMessage);
                }
                return;
            }

            let hasValidSession = isAuthenticated;

            try {
                const authResponse = (await refetchAuth()) as { data?: { status?: number } };
                hasValidSession = hasValidSession || authResponse?.data?.status === 200;
            } catch {
                hasValidSession = false;
            }

            const isSuccess = hasValidSession || hasExplicitSuccessFlag;

            if (!isSuccess) {
                if (isMounted) {
                    setStatus("error");
                    setTitle("Nao foi possivel validar sua sessao");
                    setSubtitle("Tente novamente em instantes.");
                }
                return;
            }

            if (isMounted) {
                setStatus("success");
                setTitle(mode === "link" ? "Conta social vinculada" : "Login social concluido");
                setSubtitle("Voce sera redirecionado automaticamente.");
                redirectTimer = setTimeout(() => {
                    router.replace(nextPath);
                }, SUCCESS_REDIRECT_DELAY_MS);
            }
        };

        resolveCallback();

        return () => {
            isMounted = false;
            if (redirectTimer) {
                clearTimeout(redirectTimer);
            }
        };
    }, [isAuthenticated, refetchAuth, router, searchParams, searchParamsKey]);

    return (
        <div className={styles.container}>
            <Card className={styles.card} bordered={false}>
                {status === "loading" ? (
                    <div className={styles.loadingContainer}>
                        <Spin size="large" />
                        <Typography.Title level={4} className={styles.loadingTitle}>
                            {title}
                        </Typography.Title>
                        <Typography.Text type="secondary">{subtitle}</Typography.Text>
                    </div>
                ) : (
                    <Result
                        status={status === "success" ? "success" : "error"}
                        title={title}
                        subTitle={subtitle}
                        extra={
                            <Button type="primary" onClick={() => router.replace(redirectTarget)}>
                                Continuar
                            </Button>
                        }
                    />
                )}
            </Card>
        </div>
    );
};

export default SocialCallbackPage;
