import { createContext, useContext, useEffect, useState } from "react";

import { FileTextOutlined, HomeOutlined, LineChartOutlined, SnippetsOutlined } from "@ant-design/icons";
import {
    faCalendarDays,
    faChartPie,
    faFileInvoice,
    faMoneyBills,
    faSackDollar,
    faTags,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MenuProps } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "../auth";
import { useUser } from "../user";

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);
type MenuItemAntd = Required<MenuProps>["items"][number];
type MenuItem = {
    key: string;
    label: string;
    path: string;
    icon: React.ReactNode;
    securePath: boolean;
    userGroup?: string;
};

type LayoutContextValue = {
    selectedMenu: string;
    menuCollapsed: boolean;
    toggleCollapsed: () => void;
    menuItems: MenuItemAntd[];
};

const menuItems: MenuItem[] = [
    {
        key: "home",
        label: "Inicio",
        path: "/",
        icon: <HomeOutlined />,
        securePath: false,
    },
    {
        key: "dashboard",
        label: "Dashboard",
        path: "/internal/financial",
        icon: <LineChartOutlined />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "report",
        label: "Relatorio",
        path: "/internal/financial/report",
        icon: <FileTextOutlined />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "budget",
        label: "Orçamento",
        path: "/internal/financial/budget",
        icon: <SnippetsOutlined />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "invoices",
        label: "Notas",
        path: "/internal/financial/invoices",
        icon: <FontAwesomeIcon icon={faFileInvoice} />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "bills",
        label: "Contas",
        path: "/internal/financial/bills",
        icon: <FontAwesomeIcon icon={faMoneyBills} />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "scheduled_bills",
        label: "Contas Programadas",
        path: "/internal/financial/scheduled_bills",
        icon: <FontAwesomeIcon icon={faCalendarDays} />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "earnings",
        label: "Ganhos",
        path: "/internal/financial/earnings",
        icon: <FontAwesomeIcon icon={faSackDollar} />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "tags",
        label: "Tags",
        path: "/internal/financial/tags",
        icon: <FontAwesomeIcon icon={faTags} />,
        securePath: true,
        userGroup: "financial",
    },
    {
        key: "analytics",
        label: "Analytics",
        path: "/admin/analytics",
        icon: <FontAwesomeIcon icon={faChartPie} />,
        securePath: true,
        userGroup: "admin",
    },
];

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const { groups } = useUser();
    const { isAuthenticated } = useAuth();

    const [menuCollapsed, setMenuCollapsed] = useState<boolean>(false);

    const toggleCollapsed = () => {
        setMenuCollapsed((prev) => !prev);
    };

    const selectedMenuItem = menuItems.filter((menuItem) => menuItem.path === pathname);
    const containsPath = selectedMenuItem.length === 1;
    const selectedMenu = containsPath ? selectedMenuItem[0].key : menuItems[0].key;

    useEffect(() => {
        if (containsPath) {
            document.title = `Kawori ${selectedMenuItem[0].label}`;
        }
    }, [containsPath, selectedMenu, selectedMenuItem]);

    const menuItemsAntd: MenuItemAntd[] = menuItems
        .filter((menuItem) => {
            const isSecure = isAuthenticated || !menuItem.securePath;
            const containsGroup = menuItem.userGroup ? groups?.includes(menuItem.userGroup) : true;
            return isSecure && containsGroup;
        })
        .map(
            (menuItem) =>
                ({
                    key: menuItem.key,
                    label: <Link href={menuItem.path}>{menuItem.label}</Link>,
                    icon: menuItem.icon,
                }) as MenuItemAntd,
        );

    return (
        <LayoutContext.Provider
            value={{
                selectedMenu,
                menuCollapsed,
                toggleCollapsed,
                menuItems: menuItemsAntd,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = (): LayoutContextValue => {
    const ctx = useContext(LayoutContext);
    if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
    return ctx;
};
