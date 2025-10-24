import {
    AppstoreOutlined,
    HomeOutlined,
    LineChartOutlined,
    SettingOutlined,
    SnippetsOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Layout, Menu, MenuProps } from "antd";
import Link from "next/link";

import styles from "./Menu.module.scss";

import { authStatus, IUser } from "@/lib/features/auth";
import { Theme } from "@/styles/theme";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faFileInvoice, faMoneyBills, faTags } from "@fortawesome/free-solid-svg-icons";

type MenuItem = Required<MenuProps>["items"][number];
export type MenuItemKey =
    | "home"
    | "user"
    | "facetexture"
    | "rank"
    | "controller"
    | "command"
    | "remote"
    | "status"
    | "financial"
    | "overview"
    | "contracts"
    | "invoices"
    | "payments"
    | "tags"
    | "server"
    | "analytics";

const { Sider } = Layout;

const menuItens = (groups: string[]): MenuItem[] => {
    const baseItens: MenuItem[] = [
        {
            label: <Link href={"/"}>Inicio</Link>,
            key: "home",
            icon: <HomeOutlined />,
        },
    ];

    if (!groups || groups.length <= 0) {
        return baseItens;
    }

    if (groups.includes("user")) {
        baseItens.push({
            label: <Link href={"/internal/user"}>Conta</Link>,
            key: "user",
            icon: <UserOutlined />,
        });
    }

    if (groups.includes("financial")) {
        baseItens.push(
            {
                label: <Link href={"/internal/financial/overview"}>Overview</Link>,
                key: "overview",
                icon: <LineChartOutlined />,
            },
            {
                label: <Link href={"/internal/financial/contracts"}>Contratos</Link>,
                key: "contracts",
                icon: <SnippetsOutlined />,
            },
            {
                label: <Link href={"/internal/financial/invoices"}>Notas</Link>,
                key: "invoices",
                icon: <FontAwesomeIcon icon={faFileInvoice} />,
            },
            {
                label: <Link href={"/internal/financial/payments"}>Pagamentos</Link>,
                key: "payments",
                icon: <FontAwesomeIcon icon={faMoneyBills} />,
            },
            {
                label: <Link href={"/internal/financial/tags"}>Tags</Link>,
                key: "tags",
                icon: <FontAwesomeIcon icon={faTags} />,
            },
        );
    }

    if (groups.includes("admin")) {
        baseItens.push({
            label: <Link href={"/admin/analytics"}>Analytics</Link>,
            key: "analytics",
            icon: <FontAwesomeIcon icon={faChartPie} />,
        });
    }

    return baseItens;
};

interface IMenuInternal {
    theme: Theme;
    selectedMenu: MenuItemKey[];
    groups: string[];
}
const MenuInternal = ({ theme, selectedMenu, groups }: IMenuInternal) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);

    const toggleCollapsed = () => {
        setCollapsed((prev) => !prev);
    };

    return (
        <Sider breakpoint="lg" collapsedWidth="0" onCollapse={toggleCollapsed} theme={theme} collapsed={collapsed}>
            <div className={styles["logo-container"]}>
                <Link href="/" className={styles["logo"]}>
                    Kawori
                </Link>
            </div>
            <Menu theme={theme} selectedKeys={selectedMenu} mode="vertical" items={menuItens(groups)} />
        </Sider>
    );
};

export default MenuInternal;
