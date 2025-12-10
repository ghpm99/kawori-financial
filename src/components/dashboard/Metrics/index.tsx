import { DollarOutlined, RiseOutlined, ShoppingCartOutlined, TrophyOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";

import { CardProps } from "@/components/providers/dashboard";
import styles from "./Metrics.module.scss";
import { memo } from "react";

interface IDashboardMetricsProps {
    revenues: CardProps;
    expenses: CardProps;
    profit: CardProps;
    growth: Omit<CardProps, "metric_value">;
}
const DashboardMetrics = ({ revenues, expenses, profit, growth }: IDashboardMetricsProps) => {
    return (
        <Row gutter={[24, 24]} className={styles.metricsRow}>
            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.metricCard}>
                    <Statistic
                        loading={revenues.loading}
                        title="Receita Total"
                        value={revenues.value}
                        precision={2}
                        valueStyle={{ color: "#3f8600" }}
                        prefix={<DollarOutlined />}
                        suffix="R$"
                    />
                    <div className={`${styles.metricChange} ${styles[revenues.status]}`}>
                        {revenues.metricIcon}
                        <span>{revenues.metric_value}%</span>
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.metricCard}>
                    <Statistic
                        loading={expenses.loading}
                        title="Gastos Totais"
                        value={expenses.value}
                        precision={2}
                        valueStyle={{ color: "#cf1322" }}
                        prefix={<ShoppingCartOutlined />}
                        suffix="R$"
                    />
                    <div className={`${styles.metricChange} ${styles[expenses.status]}`}>
                        {expenses.metricIcon}
                        <span>{expenses.metric_value}%</span>
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.metricCard}>
                    <Statistic
                        title="Lucro Líquido"
                        loading={profit.loading}
                        value={profit.value}
                        precision={2}
                        valueStyle={{ color: "#1890ff" }}
                        prefix={<TrophyOutlined />}
                        suffix="R$"
                    />
                    <div className={`${styles.metricChange} ${styles[profit.status]}`}>
                        {profit.metricIcon}
                        <span>{profit.metric_value}%</span>
                    </div>
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.metricCard}>
                    <Statistic
                        title="Crescimento"
                        loading={growth.loading}
                        value={growth.value}
                        precision={1}
                        valueStyle={{ color: "#722ed1" }}
                        prefix={<RiseOutlined />}
                        suffix="%"
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default memo(DashboardMetrics);
