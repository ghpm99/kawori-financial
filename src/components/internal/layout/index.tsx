import Footer from '@/components/footer';
import Header from '@/components/header';
import SideBard from '@/components/sidebar';
import { Layout as LayoutLib } from 'antd';
import { Outlet } from 'react-router-dom';
import styles from './layout.module.scss';

const InternalLayout = () => {
    return (
        <div className={styles.layout}>
            <div className={styles.header}>
                <Header />
            </div>
            <div className={styles.sidebar}>
                <SideBard />
            </div>
            <div className={styles.content}>
                <Outlet />
            </div>
            <div className={styles.footer}>
                <Footer />
            </div>
        </div>
    );
};

export default InternalLayout;
