import { Layout, Menu, MenuProps } from "antd";
import Link from "next/link";

import { Theme } from "@/styles/theme";

import styles from "./Menu.module.scss";

type MenuItem = Required<MenuProps>["items"][number];

const { Sider } = Layout;

interface IMenuInternal {
    theme: Theme;
    selectedMenu: string;
    collapsed: boolean;
    toggleCollapsed: () => void;
    menuItems: MenuItem[];
}
const MenuInternal = ({ theme, selectedMenu, collapsed, toggleCollapsed, menuItems }: IMenuInternal) => {
    return (
        <Sider breakpoint="lg" collapsedWidth="0" onCollapse={toggleCollapsed} theme={theme} collapsed={collapsed}>
            <div className={styles["logo-container"]}>
                <Link href="/" className={styles["logo"]}>
                    Kawori
                </Link>
            </div>
            <Menu theme={theme} selectedKeys={[selectedMenu]} mode="vertical" items={menuItems} />
        </Sider>
    );
};

export default MenuInternal;
