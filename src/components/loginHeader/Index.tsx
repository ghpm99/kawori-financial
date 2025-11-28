import { useState } from "react";

import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button } from "antd";
import Link from "next/link";

import ThemeControl from "../themeControl";
import UserDrawer from "../user";
import S from "./Login.module.scss";
import { IUserData } from "../providers/user";

export interface IUser {
    id: number;
    name: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_staff: boolean;
    is_active: boolean;
    is_superuser: boolean;
    last_login: string;
    date_joined: string;
    image?: string;
}

interface ILoginHeaderProps {
    user?: IUserData;
    isAuthenticated: boolean;
    handleSignout: () => void;
}
const LoginHeader = ({ user, isAuthenticated, handleSignout }: ILoginHeaderProps) => {
    const [open, setOpen] = useState(false);

    const onClose = () => {
        setOpen(false);
    };

    const onOpen = () => {
        setOpen(true);
    };

    return (
        <div className={S.layout}>
            <ThemeControl />
            {isAuthenticated ? (
                <>
                    <div onClick={onOpen} className={S.button}>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {user?.name}
                    </div>
                    {user && <UserDrawer user={user} onClose={onClose} open={open} onSignout={handleSignout} />}
                </>
            ) : (
                <div className={S.buttons}>
                    <Button type="primary" className={S.button}>
                        <Link href="/signin">Logar</Link>
                    </Button>
                    <Button type="default" className={S.button}>
                        <Link href="/signup">Cadastrar</Link>
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LoginHeader;
