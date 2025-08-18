import { useLayout } from '@/providers/layout';
import {
    BellOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Avatar, Badge, Breadcrumb, Button, Dropdown, Layout } from 'antd';
import Search from 'antd/es/input/Search';
import styles from './header.module.scss';

const { Header: HeaderLib } = Layout;

const Header = () => {
    const { collapsed, setCollapsed, getBreadcrumbItems, userMenuItems } = useLayout();
    return (
        <HeaderLib className={styles.header}>
            <div className={styles.headerLeft}>
                <Button
                    type="text"
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    className={styles.collapseButton}
                />
                <Breadcrumb items={getBreadcrumbItems()} className={styles.breadcrumb} />
            </div>

            <div className={styles.headerRight}>
                <Search
                    placeholder="Buscar..."
                    allowClear
                    className={styles.search}
                    style={{ width: 250 }}
                />

                <Badge count={3} size="small">
                    <Button
                        type="text"
                        icon={<BellOutlined />}
                        className={styles.notificationButton}
                    />
                </Badge>

                <Dropdown
                    menu={{ items: userMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                >
                    <div className={styles.userProfile}>
                        <Avatar size="small" icon={<UserOutlined />} className={styles.avatar} />
                        <span className={styles.userName}>João Silva</span>
                    </div>
                </Dropdown>
            </div>
        </HeaderLib>
    );
};

export default Header;
