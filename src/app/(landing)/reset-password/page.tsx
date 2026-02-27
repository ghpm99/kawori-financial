"use client";

import { useState } from "react";

import { Card } from "antd";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

import EmailStep from "@/components/resetPassword/emailStep";
import NewPasswordStep from "@/components/resetPassword/newPasswordStep";
import SuccessStep from "@/components/resetPassword/successStep";
import TokenStep from "@/components/resetPassword/tokenStep";
import {
    confirmPasswordResetService,
    requestPasswordResetService,
    validatePasswordResetTokenService,
} from "@/services/auth";

import styles from "./resetPassword.module.scss";

type Step = "email" | "token" | "password" | "success";

const ResetPasswordPage = () => {
    const [step, setStep] = useState<Step>("email");
    const [token, setToken] = useState("");
    const [emailError, setEmailError] = useState<string | undefined>();
    const [tokenError, setTokenError] = useState<string | undefined>();
    const [passwordError, setPasswordError] = useState<string | string[] | undefined>();

    const titleMap: Record<Step, string> = {
        email: "Redefinir senha",
        token: "Verificar token",
        password: "Nova senha",
        success: "",
    };

    const emailMutation = useMutation({
        mutationFn: requestPasswordResetService,
        onSuccess: () => {
            setEmailError(undefined);
            setStep("token");
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
                setEmailError(error.response?.data?.msg ?? "Erro ao enviar e-mail. Tente novamente.");
            } else {
                setEmailError("Erro ao enviar e-mail. Tente novamente.");
            }
        },
    });

    const tokenMutation = useMutation({
        mutationFn: validatePasswordResetTokenService,
        onSuccess: (response, variables) => {
            if (response.data.valid) {
                setToken(variables);
                setTokenError(undefined);
                setStep("password");
            } else {
                setTokenError(response.data.msg ?? "Token inválido ou expirado.");
            }
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
                setTokenError(error.response?.data?.msg ?? "Erro ao validar token. Tente novamente.");
            } else {
                setTokenError("Erro ao validar token. Tente novamente.");
            }
        },
    });

    const passwordMutation = useMutation({
        mutationFn: (newPassword: string) => confirmPasswordResetService({ token, new_password: newPassword }),
        onSuccess: () => {
            setPasswordError(undefined);
            setStep("success");
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error)) {
                const msg = error.response?.data?.msg;
                setPasswordError(msg ?? "Erro ao redefinir senha. Tente novamente.");
            } else {
                setPasswordError("Erro ao redefinir senha. Tente novamente.");
            }
        },
    });

    return (
        <div className={styles.container}>
            <Card className={styles.card} bordered={false}>
                {step !== "success" && <h1 className={styles.title}>{titleMap[step]}</h1>}
                {step === "email" && (
                    <EmailStep
                        onSuccess={(email) => emailMutation.mutate({ email })}
                        errorMessage={emailError}
                        isLoading={emailMutation.isPending}
                    />
                )}
                {step === "token" && (
                    <TokenStep
                        onSuccess={(t) => tokenMutation.mutate(t)}
                        errorMessage={tokenError}
                        isLoading={tokenMutation.isPending}
                    />
                )}
                {step === "password" && (
                    <NewPasswordStep
                        onSuccess={(newPassword) => passwordMutation.mutate(newPassword)}
                        errorMessage={passwordError}
                        isLoading={passwordMutation.isPending}
                    />
                )}
                {step === "success" && <SuccessStep />}
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
