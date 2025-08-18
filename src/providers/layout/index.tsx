import {
    DashboardOutlined,
    FileTextOutlined,
    LogoutOutlined,
    PieChartOutlined,
    ProfileOutlined,
    SettingOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import type { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { createContext, useContext, useState, type JSX, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutContextProps {
    collapsed: boolean;
    setCollapsed: (value: boolean) => void;
    getBreadcrumbItems: () => { title: ReactNode }[];
    userMenuItems: ItemType[];
    menuItems?: ItemType<MenuItemType>[];
    menuSelectedKeys: string[];
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();

    const getBreadcrumbItems = () => {
        const pathSegments = pathname.split('/').filter(Boolean);
        const items = [
            {
                title: <Link to="/dashboard">Dashboard</Link>,
            },
        ];

        if (pathSegments.length > 1) {
            const currentPage = pathSegments[pathSegments.length - 1];
            const pageNames: Record<string, JSX.Element> = {
                budget: <Link to=""> Orçamento</Link>,
                diary: <Link to="">Diário</Link>,
                invoices: <Link to="">Faturas</Link>,
                payments: <Link to="">Pagamentos</Link>,
                reports: <Link to="">Relatórios</Link>,
                settings: <Link to="">Configurações</Link>,
            };

            items.push({
                title: pageNames[currentPage] || currentPage,
            });
        }

        return items;
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <ProfileOutlined />,
            label: 'Perfil',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: 'Configurações',
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Sair',
            danger: true,
        },
    ];

    const menuItems = [
        {
            key: 'financial',
            icon: <WalletOutlined />,
            label: 'Financeiro',
            children: [
                {
                    key: 'dashboard',
                    icon: <DashboardOutlined />,
                    label: <Link to="/financial/dashboard">Dashboard</Link>,
                },
                {
                    key: 'reports',
                    icon: <FileTextOutlined />,
                    label: <Link to="/financial/reports">Relatórios</Link>,
                },
                {
                    key: 'invoices',
                    icon: <WalletOutlined />,
                    label: <Link to="/financial/invoices">Faturas</Link>,
                },
                {
                    key: 'payments',
                    icon: <WalletOutlined />,
                    label: <Link to="/financial/payments">Pagamentos</Link>,
                },
                {
                    key: 'budget',
                    icon: <PieChartOutlined />,
                    label: <Link to="/financial/budget">Orçamento</Link>,
                },
            ],
        },
        {
            key: 'diary',
            icon: <FileTextOutlined />,
            label: <Link to="/diary">Diário</Link>,
        },
    ];

    const menuSelectedKeys = pathname.split('/').slice(1).filter(Boolean);

    console.log('Menu Selected Keys:', menuSelectedKeys);

    return (
        <LayoutContext.Provider
            value={{
                collapsed,
                setCollapsed,
                getBreadcrumbItems,
                userMenuItems,
                menuItems,
                menuSelectedKeys,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (!context) {
        throw new Error('useLayout deve ser usado dentro de LayoutProvider');
    }
    return context;
};
