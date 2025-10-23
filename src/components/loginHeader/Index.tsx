import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button } from "antd";

import Link from "next/link";

import { IUser } from "@/lib/features/auth";
import { useState } from "react";
import ThemeControl from "../themeControl";
import UserDrawer from "../user";
import S from "./Login.module.scss";

interface ILoginHeaderProps {
    user: IUser;
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

    const content = (
        <div>
            <div>{user?.name}</div>
            <Button onClick={handleSignout}>Deslogar</Button>
        </div>
    );

    return (
        <div className={S.layout}>
            <ThemeControl />
            {isAuthenticated ? (
                <>
                    <div onClick={onOpen} className={S.button}>
                        <Avatar size="small" icon={<UserOutlined />} />
                        {user?.name}
                    </div>
                    <UserDrawer user={user} onClose={onClose} open={open} onSignout={handleSignout} />
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
