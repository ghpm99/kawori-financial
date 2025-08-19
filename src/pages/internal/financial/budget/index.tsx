import {
    BookOutlined,
    CarOutlined,
    HomeOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    ShoppingOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Modal,
    Progress,
    Row,
} from 'antd';
import { useState } from 'react';
import styles from './budget.module.scss';
import clsx from 'clsx';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const { MonthPicker } = DatePicker;

const BudgetPage = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    const budgetData = [
        { name: 'Food', value: 800, budget: 1000, color: '#ff4d4f', icon: <ShoppingOutlined /> },
        { name: 'Transport', value: 300, budget: 400, color: '#1890ff', icon: <CarOutlined /> },
        { name: 'Housing', value: 1200, budget: 1200, color: '#52c41a', icon: <HomeOutlined /> },
        {
            name: 'Healthcare',
            value: 150,
            budget: 300,
            color: '#722ed1',
            icon: <MedicineBoxOutlined />,
        },
        { name: 'Education', value: 200, budget: 250, color: '#fa8c16', icon: <BookOutlined /> },
    ];

    const monthlyData = [
        { month: 'Jan', budget: 3000, spent: 2800 },
        { month: 'Feb', budget: 3000, spent: 3200 },
        { month: 'Mar', budget: 3000, spent: 2900 },
        { month: 'Apr', budget: 3000, spent: 2650 },
        { month: 'May', budget: 3000, spent: 2850 },
        { month: 'Jun', budget: 3000, spent: 2750 },
    ];

    const totalBudget = budgetData.reduce((sum, item) => sum + item.budget, 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + item.value, 0);
    const remaining = totalBudget - totalSpent;

    const handleAddCategory = () => {
        setIsModalVisible(true);
    };

    const handleModalOk = () => {
        form.validateFields().then((values) => {
            console.log('New category:', values);
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    return (
        <div className={styles.budget}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1 className={styles.title}>Budget</h1>
                    <p className={styles.subtitle}>
                        Track and manage your spending across different categories
                    </p>
                </div>
                <div className={styles.actions}>
                    <MonthPicker placeholder="Select month" />
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
                        Add Category
                    </Button>
                </div>
            </div>

            <Row gutter={[16, 16]} className={styles.summaryRow}>
                <Col xs={24} sm={8}>
                    <Card className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <div className={clsx(styles.summaryValue, styles.income)}>
                                ${totalBudget.toLocaleString()}
                            </div>
                            <div className={styles.summaryLabel}>Total Budget</div>
                            <Progress
                                percent={100}
                                showInfo={false}
                                strokeColor="#52c41a"
                                className={styles.summaryProgress}
                            />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <div className={clsx(styles.summaryValue, styles.expenses)}>
                                ${totalSpent.toLocaleString()}
                            </div>
                            <div className={styles.summaryLabel}>Total Spent</div>
                            <Progress
                                percent={(totalSpent / totalBudget) * 100}
                                showInfo={false}
                                strokeColor="#ff4d4f"
                                className={styles.summaryProgress}
                            />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card className={styles.summaryCard}>
                        <div className={styles.summaryContent}>
                            <div className={clsx(styles.summaryValue, styles.remaining)}>
                                ${remaining.toLocaleString()}
                            </div>
                            <div className={styles.summaryLabel}>Remaining</div>
                            <Progress
                                percent={(remaining / totalBudget) * 100}
                                showInfo={false}
                                strokeColor="#1890ff"
                                className={styles.summaryProgress}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} className={styles.contentRow}>
                <Col xs={24} lg={14}>
                    <Card className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>Monthly Budget vs Spending</h3>
                        </div>
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="budget" fill="#52c41a" name="Budget" />
                                    <Bar dataKey="spent" fill="#ff4d4f" name="Spent" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={10}>
                    <Card className={styles.categoriesCard}>
                        <div className={styles.categoriesHeader}>
                            <h3 className={styles.categoriesTitle}>Budget Categories</h3>
                        </div>

                        {budgetData.map((category, index) => {
                            const percentage = (category.value / category.budget) * 100;
                            return (
                                <div key={index} className={styles.categoryItem}>
                                    <div className={styles.categoryInfo}>
                                        <div
                                            className={styles.categoryIcon}
                                            style={{ backgroundColor: category.color }}
                                        >
                                            {category.icon}
                                        </div>
                                        <div className={styles.categoryDetails}>
                                            <div className={styles.categoryName}>
                                                {category.name}
                                            </div>
                                            <div className={styles.categoryBudget}>
                                                Budget: ${category.budget}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.categoryAmount}>
                                        <div className={styles.spent}>${category.value}</div>
                                        <div className={styles.remaining}>
                                            {percentage.toFixed(0)}% used
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Add Budget Category"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Add Category"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Category Name"
                        rules={[{ required: true, message: 'Please enter category name' }]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>

                    <Form.Item
                        name="budget"
                        label="Budget Amount"
                        rules={[{ required: true, message: 'Please enter budget amount' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="Enter budget amount"
                            min={0}
                            formatter={(value) =>
                                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            }
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                        />
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <Input.TextArea placeholder="Enter description (optional)" rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
export default BudgetPage;
