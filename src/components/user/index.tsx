"use client";

import { IUser } from "@/lib/features/auth";
import { Button, Col, DatePicker, Drawer, Form, Input, Row, Select, Space, Typography } from "antd";
import styles from "./User.module.scss";
import { useTheme } from "@/components/themeProvider/themeContext";
import { useEffect, useState } from "react";
import dayjs from "dayjs";

const { Title, Paragraph } = Typography;
const { Option } = Select;

export interface IUserDrawerProps {
    user: IUser;
    open: boolean;
    onClose: () => void;
    onSignout?: () => void;
}

const dateFormat = "DD/MM/YYYY hh:mm:ss";

const UserDrawer = ({ user, open, onClose, onSignout }: IUserDrawerProps) => {
    const [confirmSignout, setConfirmSignout] = useState(false);
    const {
        state: { theme },
    } = useTheme();

    useEffect(() => {
        setConfirmSignout(false);
    }, [open]);

    const handleSignoutClick = () => {
        if (confirmSignout) {
            if (onSignout) {
                onSignout();
            }
        } else {
            setConfirmSignout(true);
        }
    };

    return (
        <Drawer
            title={"Detalhes da conta"}
            placement={"right"}
            width={500}
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
            <Form layout="vertical" hideRequiredMark variant="underlined">
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
            </Form>
        </Drawer>
    );
};

export default UserDrawer;
