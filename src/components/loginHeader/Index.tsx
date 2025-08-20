import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Popover } from "antd";

import Link from "next/link";

import { authStatus, IUser } from "@/lib/features/auth";
import ThemeControl from "../themeControl";
import S from "./Login.module.scss";

interface ILoginHeaderProps {
    user: IUser;
    status: authStatus;
    handleSignout: () => void;
}
const LoginHeader = ({ user, status, handleSignout }: ILoginHeaderProps) => {
    const content = (
        <div>
            <div>{user?.name}</div>
            <Button onClick={handleSignout}>Deslogar</Button>
        </div>
    );

    return (
        <div className={S.layout}>
            <ThemeControl />
            {status === "authenticated" ? (
                <Popover content={content} title="Conta">
                    <Avatar size="small" icon={<UserOutlined />} />
                    {user?.name}
                </Popover>
            ) : (
                <div className={S.buttons}>
                    <Button type="primary" className={S.button}>
                        <Link href="/signin">Sign in</Link>
                    </Button>
                    <Button type="default" className={S.button}>
                        Sign up
                    </Button>
                </div>
            )}
        </div>
    );
};

export default LoginHeader;
