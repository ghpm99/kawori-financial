import { PlusOutlined } from '@ant-design/icons';
import styles from './invoices.module.scss';
import { Button, Card, Table } from 'antd';
import { useState } from 'react';
const InvoicesPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddCategory = () => {
        setIsModalVisible(true);
    };

    const dataSource = [
        {
            key: '1',
            name: 'Mike',
            age: 32,
            address: '10 Downing Street',
        },
        {
            key: '2',
            name: 'John',
            age: 42,
            address: '10 Downing Street',
        },
    ];

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ];
    return (
        <div className={styles.invoices}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Notas</h1>
                    <p className={styles.subtitle}>
                        Track and manage your spending across different categories
                    </p>
                </div>
                <div className={styles.actions}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                        Adicionar Nota
                    </Button>
                </div>
            </div>
            <div>
                <div className={styles.cards}>
                    <Card title="Total" extra={<a href="#">More</a>} style={{ width: 300 }}>
                        <p>0</p>
                    </Card>
                    <Card title="Pagos" extra={<a href="#">More</a>} style={{ width: 300 }}>
                        <p>0</p>
                    </Card>
                    <Card title="Pendentes" extra={<a href="#">More</a>} style={{ width: 300 }}>
                        <p>0</p>
                    </Card>
                    <Card title="Vencido" extra={<a href="#">More</a>} style={{ width: 300 }}>
                        <p>0</p>
                    </Card>
                </div>
                <Table dataSource={dataSource} columns={columns} />;
            </div>
        </div>
    );
};

export default InvoicesPage;
