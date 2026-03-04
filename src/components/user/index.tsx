"use client";

import { useCallback, useEffect, useState } from "react";

import { Button, Col, DatePicker, Divider, Drawer, Form, Input, Popconfirm, Row, Space, Typography } from "antd";
import axios from "axios";
import dayjs from "dayjs";

import {
    ISocialAccount,
    requestPasswordResetService,
    socialAccountsService,
    SocialProvider,
    unlinkSocialAccountService,
} from "@/services/auth";

import SocialAuthButtons from "../socialAuthButtons";
import { IUserData } from "../providers/user";
import styles from "./User.module.scss";

export interface IUserDrawerProps {
    user: IUserData;
    open: boolean;
    onClose: () => void;
    onSignout?: () => void;
}

const dateFormat = "DD/MM/YYYY hh:mm:ss";
const providerLabel: Record<SocialProvider, string> = {
    google: "Google",
    discord: "Discord",
    github: "GitHub",
    facebook: "Facebook",
    microsoft: "Microsoft",
};

const UserDrawer = ({ user, open, onClose, onSignout }: IUserDrawerProps) => {
    const [confirmSignout, setConfirmSignout] = useState(false);
    const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
    const [passwordResetMessage, setPasswordResetMessage] = useState<string | undefined>();
    const [socialAccounts, setSocialAccounts] = useState<ISocialAccount[]>([]);
    const [isLoadingSocialAccounts, setIsLoadingSocialAccounts] = useState(false);
    const [socialAccountsMessage, setSocialAccountsMessage] = useState<string | undefined>();
    const [unlinkingProvider, setUnlinkingProvider] = useState<SocialProvider | null>(null);

    const handleSignoutClick = () => {
        if (confirmSignout) {
            if (onSignout) {
                onSignout();
            }
        } else {
            setConfirmSignout(true);
        }
    };

    const handleSendPasswordReset = async () => {
        setIsSendingPasswordReset(true);
        setPasswordResetMessage(undefined);

        try {
            const response = await requestPasswordResetService({ email: user.email });
            setPasswordResetMessage(
                response.data?.msg ?? "Se o e-mail estiver cadastrado, voce recebera as instrucoes em breve.",
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setPasswordResetMessage(error.response?.data?.msg ?? "Nao foi possivel iniciar a alteracao de senha.");
            } else {
                setPasswordResetMessage("Nao foi possivel iniciar a alteracao de senha.");
            }
        } finally {
            setIsSendingPasswordReset(false);
        }
    };

    const loadSocialAccounts = useCallback(async () => {
        setIsLoadingSocialAccounts(true);
        setSocialAccountsMessage(undefined);

        try {
            const response = await socialAccountsService();
            setSocialAccounts(response.data?.accounts ?? []);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setSocialAccountsMessage(error.response?.data?.msg ?? "Nao foi possivel carregar contas sociais.");
            } else {
                setSocialAccountsMessage("Nao foi possivel carregar contas sociais.");
            }
        } finally {
            setIsLoadingSocialAccounts(false);
        }
    }, []);

    const handleUnlinkSocialAccount = async (provider: SocialProvider) => {
        setUnlinkingProvider(provider);
        setSocialAccountsMessage(undefined);

        try {
            const response = await unlinkSocialAccountService(provider);
            setSocialAccountsMessage(response.data?.msg ?? "Conta social desvinculada.");
            await loadSocialAccounts();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const backendMessage = error.response?.data?.msg;
                setSocialAccountsMessage(
                    backendMessage ??
                        "Nao foi possivel desvincular conta social. Verifique se existe outra forma de acesso.",
                );
            } else {
                setSocialAccountsMessage("Nao foi possivel desvincular conta social.");
            }
        } finally {
            setUnlinkingProvider(null);
        }
    };

    useEffect(() => {
        if (open) {
            loadSocialAccounts();
        }
    }, [open, loadSocialAccounts]);

    return (
        <Drawer
            title={"Detalhes da conta"}
            placement={"right"}
            size={"default"}
            onClose={onClose}
            open={open}
            extra={
                <Space>
                    <Button onClick={onClose} type="primary">
                        Salvar
                    </Button>
                    {onSignout && (
                        <Button onClick={handleSignoutClick} danger>
                            {confirmSignout ? "Confirmar" : "Deslogar"}
                        </Button>
                    )}
                </Space>
            }
        >
            <Form layout="vertical" variant="underlined">
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="name"
                            label="Nome"
                            rules={[{ required: true, message: "Please enter user name" }]}
                            initialValue={user?.name ?? ""}
                        >
                            <Input placeholder="Please enter user name" disabled />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="username"
                            label="Usuario"
                            rules={[{ required: true, message: "Please enter user name" }]}
                            initialValue={user?.username ?? ""}
                        >
                            <Input placeholder="Please enter user name" disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="first_name"
                            label="Primeiro nome"
                            rules={[{ required: true, message: "Please enter user name" }]}
                            initialValue={user?.first_name ?? ""}
                        >
                            <Input placeholder="Please enter user name" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="last_name"
                            label="Ultimo nome"
                            rules={[{ required: true, message: "Please enter user name" }]}
                            initialValue={user?.last_name ?? ""}
                        >
                            <Input placeholder="Please enter user name" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item
                            name="email"
                            label="E-mail"
                            rules={[{ required: true, message: "Please enter user name" }]}
                            initialValue={user?.email ?? ""}
                        >
                            <Input placeholder="Please enter user name" disabled />
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="date_joined"
                            label="Data cadastrada"
                            rules={[{ required: true, message: "Please choose the dateTime" }]}
                            initialValue={user?.date_joined ? dayjs(user.date_joined) : undefined}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                getPopupContainer={(trigger) => trigger.parentElement!}
                                format={dateFormat}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="last_login"
                            label="Ultimo login"
                            rules={[{ required: true, message: "Please choose the dateTime" }]}
                            initialValue={user?.last_login ? dayjs(user.last_login) : undefined}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                getPopupContainer={(trigger) => trigger.parentElement!}
                                format={dateFormat}
                                disabled
                            />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider />
                <div className={styles.socialAuthSection}>
                    <Typography.Text className={styles.socialAuthTitle} type="secondary">
                        Vincular contas sociais
                    </Typography.Text>
                    <SocialAuthButtons mode="link" compact />
                    <div className={styles.socialAccountsList}>
                        {isLoadingSocialAccounts && (
                            <Typography.Text type="secondary">Carregando contas vinculadas...</Typography.Text>
                        )}
                        {!isLoadingSocialAccounts && socialAccounts.length === 0 && (
                            <Typography.Text type="secondary">Nenhuma conta social vinculada.</Typography.Text>
                        )}
                        {!isLoadingSocialAccounts &&
                            socialAccounts.map((account) => (
                                <div key={account.provider} className={styles.socialAccountItem}>
                                    <div className={styles.socialAccountInfo}>
                                        <Typography.Text strong>{providerLabel[account.provider]}</Typography.Text>
                                        <Typography.Text type="secondary">{account.email}</Typography.Text>
                                    </div>
                                    <Popconfirm
                                        title="Desvincular conta social"
                                        description={`Deseja realmente desvincular ${providerLabel[account.provider]}?`}
                                        okText="Desvincular"
                                        cancelText="Cancelar"
                                        onConfirm={() => handleUnlinkSocialAccount(account.provider)}
                                    >
                                        <Button danger loading={unlinkingProvider === account.provider}>
                                            Desvincular
                                        </Button>
                                    </Popconfirm>
                                </div>
                            ))}
                        {socialAccountsMessage && (
                            <Typography.Paragraph className={styles.socialAccountsFeedback}>
                                {socialAccountsMessage}
                            </Typography.Paragraph>
                        )}
                    </div>
                </div>
                <Divider />
                <div className={styles.passwordSection}>
                    <Typography.Text className={styles.passwordTitle} type="secondary">
                        Alterar senha
                    </Typography.Text>
                    <Typography.Paragraph className={styles.passwordDescription}>
                        Enviaremos um link de redefinicao para o e-mail da sua conta.
                    </Typography.Paragraph>
                    <Button onClick={handleSendPasswordReset} loading={isSendingPasswordReset}>
                        Enviar link para alterar senha
                    </Button>
                    {passwordResetMessage && (
                        <Typography.Paragraph className={styles.passwordFeedback}>
                            {passwordResetMessage}
                        </Typography.Paragraph>
                    )}
                </div>
            </Form>
        </Drawer>
    );
};

export default UserDrawer;
