import { formatMoney } from "@/util";
import { Card, Col } from "antd";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./PaymentsChart.module.scss";
import type { PaymentsChart } from "@/components/providers/dashboard";
import { memo } from "react";

interface IPaymentsChartProps {
    paymentsChart: PaymentsChart[];
}
const PaymentsChart = ({ paymentsChart }: IPaymentsChartProps) => {
    return (
        <Col xs={24} lg={8}>
            <Card title="Receita vs Gastos" className={styles.chartCard}>
                <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={paymentsChart}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                            labelStyle={{ color: "black" }}
                            formatter={(value: number) => [formatMoney(value), ""]}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#52c41a" strokeWidth={3} name="Receita" />
                        <Line type="monotone" dataKey="expenses" stroke="#ff4d4f" strokeWidth={3} name="Gastos" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </Col>
    );
};

export default memo(PaymentsChart);
