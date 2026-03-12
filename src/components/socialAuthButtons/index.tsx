"use client";

import { useEffect, useMemo, useState } from "react";

import { Button, Spin, Typography, message } from "antd";

import { SocialProvider, socialAuthorizeService, socialProvidersService } from "@/services/auth";

import styles from "./socialAuthButtons.module.scss";

type SocialAuthMode = "login" | "link";

interface ISocialAuthButtonsProps {
    mode: SocialAuthMode;
    className?: string;
    compact?: boolean;
    title?: string;
}

interface IProviderMeta {
    label: string;
    initials: string;
}

const SOCIAL_PROVIDER_ORDER: SocialProvider[] = ["google", "discord", "github", "facebook", "microsoft"];

const SOCIAL_PROVIDER_META: Record<SocialProvider, IProviderMeta> = {
    google: { label: "Google", initials: "G" },
    discord: { label: "Discord", initials: "D" },
    github: { label: "GitHub", initials: "GH" },
    facebook: { label: "Facebook", initials: "F" },
    microsoft: { label: "Microsoft", initials: "MS" },
};

const buildFrontendRedirectUri = (mode: SocialAuthMode) => {
    if (typeof window === "undefined") {
        return undefined;
    }

    const callbackUrl = new URL("/social/callback", window.location.origin);
    callbackUrl.searchParams.set("mode", mode);
    callbackUrl.searchParams.set("next", mode === "link" ? window.location.href : "/internal/financial");

    return callbackUrl.toString();
};

const SocialAuthButtons = ({ mode, className, compact = false, title }: ISocialAuthButtonsProps) => {
    const [isLoadingProviders, setIsLoadingProviders] = useState(true);
    const [providers, setProviders] = useState<SocialProvider[]>([]);
    const [isRedirectingProvider, setIsRedirectingProvider] = useState<SocialProvider | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadProviders = async () => {
            try {
                const response = await socialProvidersService();
                const availableProviders = response.data?.providers?.map((item) => item.provider) ?? [];
                const sortedProviders = SOCIAL_PROVIDER_ORDER.filter((provider) =>
                    availableProviders.includes(provider),
                );

                if (isMounted) {
                    setProviders(sortedProviders);
                }
            } catch {
                if (isMounted) {
                    setProviders([]);
                    message.error("Nao foi possivel carregar os provedores de login social.");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingProviders(false);
                }
            }
        };

        loadProviders();

        return () => {
            isMounted = false;
        };
    }, []);

    const actionLabel = useMemo(() => {
        return mode === "link" ? "Vincular" : "Continuar com";
    }, [mode]);

    const handleSocialAuth = async (provider: SocialProvider) => {
        const frontendRedirectUri = buildFrontendRedirectUri(mode);

        setIsRedirectingProvider(provider);
        try {
            const response = await socialAuthorizeService(provider, {
                mode,
                frontend_redirect_uri: frontendRedirectUri,
            });

            const authorizeUrl = response.data?.authorize_url;
            if (!authorizeUrl) {
                message.error("Nao foi possivel iniciar o login social.");
                return;
            }

            window.location.assign(authorizeUrl);
        } catch {
            message.error("Falha ao iniciar autenticacao social.");
        } finally {
            setIsRedirectingProvider(null);
        }
    };

    if (isLoadingProviders) {
        return (
            <div className={[styles.container, className].filter(Boolean).join(" ")}>
                <Spin size="small" />
            </div>
        );
    }

    if (!providers.length) {
        return null;
    }

    return (
        <div className={[styles.container, className].filter(Boolean).join(" ")}>
            {title && (
                <Typography.Text className={styles.title} type="secondary">
                    {title}
                </Typography.Text>
            )}
            <div className={[styles.buttonGrid, compact ? styles.compact : ""].filter(Boolean).join(" ")}>
                {providers.map((provider) => {
                    const providerMeta = SOCIAL_PROVIDER_META[provider];
                    return (
                        <Button
                            key={provider}
                            className={styles.button}
                            onClick={() => handleSocialAuth(provider)}
                            loading={isRedirectingProvider === provider}
                            block={!compact}
                        >
                            <span className={styles.icon} aria-hidden="true">
                                {providerMeta.initials}
                            </span>
                            {actionLabel} {providerMeta.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );
};

export default SocialAuthButtons;
