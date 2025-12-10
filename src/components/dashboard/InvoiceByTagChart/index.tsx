import type { InvoiceByTag } from "@/components/providers/dashboard";
import { Card, Col } from "antd";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import styles from "./InvoiceByTagChart.module.scss";
import { memo } from "react";

interface IInvoiceByTagChartProps {
    invoiceByTag: InvoiceByTag[];
}
const InvoiceByTagChart = ({ invoiceByTag }: IInvoiceByTagChartProps) => {
    return (
        <Col xs={24} lg={16}>
            <Card title="Gastos por Categoria" className={styles.chartCard}>
                <ResponsiveContainer width="100%" height={500}>
                    <BarChart data={invoiceByTag} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`} />
                        <YAxis
                            dataKey="category"
                            type="category"
                            width={150}
                            tick={{ fontSize: 12 }}
                            interval={0}
                            tickSize={10}
                        />
                        <Tooltip
                            labelStyle={{ color: "black" }}
                            formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Valor"]}
                        />
                        <Bar dataKey="amount" name="Valor" animationDuration={1500}>
                            {invoiceByTag.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </Col>
    );
};

export default memo(InvoiceByTagChart);
