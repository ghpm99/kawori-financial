import { useLayout } from '@/providers/layout';
import { SettingOutlined, WalletOutlined } from '@ant-design/icons';
import { Divider, Layout, Menu } from 'antd';
import styles from './sidebar.module.scss';
import { Link } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const SideBard = () => {
    const { collapsed, menuItems, menuSelectedKeys } = useLayout();

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className={styles.sider}
            width={280}
            collapsedWidth={80}
        >
            <div className={styles.logo}>
                <WalletOutlined className={styles.logoIcon} />
                {!collapsed && <span className={styles.logoText}>Kawori Financial</span>}
            </div>
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={menuSelectedKeys}
                items={menuItems}
                className={styles.menu}
            />
            <Divider style={{ margin: 0 }} />

            <Link to={'/settings'}>
                <div className={styles.settings}>
                    <SettingOutlined className={styles.settingsIcon} />
                    {!collapsed && <span className={styles.menuText}>Configurações</span>}
                </div>
            </Link>
        </Sider>
    );
};

export default SideBard;
