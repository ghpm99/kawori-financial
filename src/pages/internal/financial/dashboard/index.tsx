'use client';

import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space } from 'antd';
import {
    ArrowUpOutlined,
    ArrowDownOutlined,
    DollarOutlined,
    ShoppingCartOutlined,
    TrophyOutlined,
    RiseOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import styles from './dashboard.module.scss';

const revenueData = [
    { month: 'Jan', revenue: 4000, expenses: 2400 },
    { month: 'Fev', revenue: 3000, expenses: 1398 },
    { month: 'Mar', revenue: 2000, expenses: 9800 },
    { month: 'Abr', revenue: 2780, expenses: 3908 },
    { month: 'Mai', revenue: 1890, expenses: 4800 },
    { month: 'Jun', revenue: 2390, expenses: 3800 },
];

const expenseData = [
    { category: 'Alimentação', amount: 1200 },
    { category: 'Transporte', amount: 800 },
    { category: 'Moradia', amount: 2000 },
    { category: 'Lazer', amount: 600 },
    { category: 'Saúde', amount: 400 },
];

const transactionColumns = [
    {
        title: 'Data',
        dataIndex: 'date',
        key: 'date',
    },
    {
        title: 'Descrição',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: 'Categoria',
        dataIndex: 'category',
        key: 'category',
        render: (category: string) => (
            <Tag color={category === 'Receita' ? 'green' : 'red'}>{category}</Tag>
        ),
    },
    {
        title: 'Valor',
        dataIndex: 'amount',
        key: 'amount',
        render: (amount: number) => (
            <span className={amount > 0 ? styles.positive : styles.negative}>
                R$ {Math.abs(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => (
            <Tag color={status === 'Concluído' ? 'green' : 'orange'}>{status}</Tag>
        ),
    },
    {
        title: 'Ações',
        key: 'actions',
        render: () => (
            <Space size="middle">
                <Button type="text" icon={<EyeOutlined />} size="small" />
                <Button type="text" icon={<EditOutlined />} size="small" />
                <Button type="text" icon={<DeleteOutlined />} size="small" danger />
            </Space>
        ),
    },
];

const transactionData = [
    {
        key: '1',
        date: '2024-01-15',
        description: 'Salário',
        category: 'Receita',
        amount: 5000,
        status: 'Concluído',
    },
    {
        key: '2',
        date: '2024-01-14',
        description: 'Supermercado',
        category: 'Alimentação',
        amount: -250,
        status: 'Concluído',
    },
    {
        key: '3',
        date: '2024-01-13',
        description: 'Combustível',
        category: 'Transporte',
        amount: -120,
        status: 'Pendente',
    },
    {
        key: '4',
        date: '2024-01-12',
        description: 'Freelance',
        category: 'Receita',
        amount: 800,
        status: 'Concluído',
    },
];

const DashboardPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Dashboard Financeiro</h1>
                <p className={styles.subtitle}>Visão geral das suas finanças</p>
            </div>

            {/* Métricas Principais */}
            <Row gutter={[24, 24]} className={styles.metricsRow}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.metricCard}>
                        <Statistic
                            title="Receita Total"
                            value={24500}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<DollarOutlined />}
                            suffix="R$"
                        />
                        <div className={styles.metricChange}>
                            <ArrowUpOutlined className={styles.positive} />
                            <span className={styles.positive}>12.5%</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.metricCard}>
                        <Statistic
                            title="Gastos Totais"
                            value={8200}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ShoppingCartOutlined />}
                            suffix="R$"
                        />
                        <div className={styles.metricChange}>
                            <ArrowDownOutlined className={styles.negative} />
                            <span className={styles.negative}>3.2%</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.metricCard}>
                        <Statistic
                            title="Lucro Líquido"
                            value={16300}
                            precision={2}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<TrophyOutlined />}
                            suffix="R$"
                        />
                        <div className={styles.metricChange}>
                            <ArrowUpOutlined className={styles.positive} />
                            <span className={styles.positive}>18.7%</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className={styles.metricCard}>
                        <Statistic
                            title="Crescimento"
                            value={25}
                            precision={1}
                            valueStyle={{ color: '#722ed1' }}
                            prefix={<RiseOutlined />}
                            suffix="%"
                        />
                        <div className={styles.metricChange}>
                            <ArrowUpOutlined className={styles.positive} />
                            <span className={styles.positive}>5.3%</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Gráficos */}
            <Row gutter={[24, 24]} className={styles.chartsRow}>
                <Col xs={24} lg={16}>
                    <Card title="Receita vs Gastos" className={styles.chartCard}>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number) => [
                                        `R$ ${value.toLocaleString('pt-BR')}`,
                                        '',
                                    ]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#52c41a"
                                    strokeWidth={3}
                                    name="Receita"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="expenses"
                                    stroke="#ff4d4f"
                                    strokeWidth={3}
                                    name="Gastos"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Gastos por Categoria" className={styles.chartCard}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={expenseData} layout="horizontal">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="category" type="category" width={80} />
                                <Tooltip
                                    formatter={(value: number) => [
                                        `R$ ${value.toLocaleString('pt-BR')}`,
                                        'Valor',
                                    ]}
                                />
                                <Bar dataKey="amount" fill="#1890ff" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Metas de Economia */}
            <Row gutter={[24, 24]} className={styles.goalsRow}>
                <Col xs={24} lg={12}>
                    <Card title="Metas de Economia" className={styles.goalsCard}>
                        <div className={styles.goalItem}>
                            <div className={styles.goalHeader}>
                                <span>Viagem de Férias</span>
                                <span>R$ 3.500 / R$ 5.000</span>
                            </div>
                            <Progress percent={70} strokeColor="#52c41a" />
                        </div>
                        <div className={styles.goalItem}>
                            <div className={styles.goalHeader}>
                                <span>Emergência</span>
                                <span>R$ 2.800 / R$ 10.000</span>
                            </div>
                            <Progress percent={28} strokeColor="#faad14" />
                        </div>
                        <div className={styles.goalItem}>
                            <div className={styles.goalHeader}>
                                <span>Novo Carro</span>
                                <span>R$ 8.200 / R$ 25.000</span>
                            </div>
                            <Progress percent={33} strokeColor="#1890ff" />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="Resumo do Mês" className={styles.summaryCard}>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Orçamento Planejado</span>
                            <span className={styles.summaryValue}>R$ 4.500</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Gasto Atual</span>
                            <span className={styles.summaryValue}>R$ 3.200</span>
                        </div>
                        <div className={styles.summaryItem}>
                            <span className={styles.summaryLabel}>Restante</span>
                            <span className={`${styles.summaryValue} ${styles.positive}`}>
                                R$ 1.300
                            </span>
                        </div>
                        <div className={styles.summaryProgress}>
                            <Progress
                                percent={71}
                                strokeColor="#52c41a"
                                format={() => '71% do orçamento usado'}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Transações Recentes */}
            <Row gutter={[24, 24]} className={styles.transactionsRow}>
                <Col span={24}>
                    <Card title="Transações Recentes" className={styles.transactionsCard}>
                        <Table
                            columns={transactionColumns}
                            dataSource={transactionData}
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 800 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardPage;
