import { Card, Col, Empty, Row } from "antd";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useReport } from "@/components/providers/report";
import { formatMoney } from "@/util";

import styles from "../Overview.module.scss";

const STATUS_COLORS = ["#52c41a", "#faad14"];

export function ReportCharts() {
    const { isLoadingPage, trendData, invoiceByTagData, paymentStatusData } = useReport();

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
                <Card title="Entradas x Saidas por mes" className={styles.chartCard} loading={isLoadingPage}>
                    <div className={styles.chartArea}>
                        <ResponsiveContainer>
                            <LineChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                <Legend />
                                <Line type="monotone" dataKey="credit" name="Entradas" stroke="#52c41a" />
                                <Line type="monotone" dataKey="debit" name="Saidas" stroke="#ff4d4f" />
                                <Line type="monotone" dataKey="difference" name="Saldo mensal" stroke="#1677ff" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="Evolucao do saldo acumulado" className={styles.chartCard} loading={isLoadingPage}>
                    <div className={styles.chartArea}>
                        <ResponsiveContainer>
                            <AreaChart data={trendData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="accumulated"
                                    name="Acumulado"
                                    stroke="#1677ff"
                                    fill="#1677ff33"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="Composicao de gastos por categoria" className={styles.chartCard} loading={isLoadingPage}>
                    {invoiceByTagData.length === 0 ? (
                        <div className={styles.chartEmpty}>
                            <Empty description="Sem dados por categoria" />
                        </div>
                    ) : (
                        <div className={styles.chartArea}>
                            <ResponsiveContainer>
                                <BarChart data={invoiceByTagData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                    <Legend />
                                    <Bar dataKey="amount" name="Valor total" fill="#1677ff" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            </Col>

            <Col xs={24} lg={12}>
                <Card title="Saude das pendencias" className={styles.chartCard} loading={isLoadingPage}>
                    <div className={styles.chartArea}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={paymentStatusData} dataKey="value" nameKey="name" outerRadius={105} label>
                                    {paymentStatusData.map((item, index) => (
                                        <Cell key={item.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatMoney(Number(value))} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </Col>
        </Row>
    );
}
