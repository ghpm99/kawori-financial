"use client";

import { Breadcrumb, Flex, Layout, Table, Tag, Typography } from "antd";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
} from "chart.js";

import { formatMoney, formatterDate } from "@/util/index";

import { IPaymentMonth } from "@/components/providers/report";
import { useTheme } from "@/components/providers/themeProvider/themeContext";
import { fetchMonthPayments } from "@/services/financial/report";
import { useQuery } from "@tanstack/react-query";
import { ColumnType } from "antd/lib/table/interface";
import styles from "./monthly.module.scss";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const headerTableFinancial: ColumnType<IPaymentMonth>[] = [
    {
        title: "Nome",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Dia",
        dataIndex: "date",
        key: "date",
        render: (date: string) => formatterDate(date),
    },
    {
        title: "Entrada",
        dataIndex: "total_value_credit",
        key: "total_value_credit",
        render: (value: number) => <Tag color="green">+{formatMoney(value ?? 0)}</Tag>,
    },
    {
        title: "Saída",
        dataIndex: "total_value_debit",
        key: "total_value_debit",
        render: (value: number) => <Tag color="volcano">-{formatMoney(value ?? 0)}</Tag>,
    },
    {
        title: "Total",
        dataIndex: "total",
        key: "total",
        render: (total: number) => (
            <>
                {total >= 0 ? (
                    <Tag color="green">+{formatMoney(total)}</Tag>
                ) : (
                    <Tag color="volcano">{formatMoney(total)}</Tag>
                )}
            </>
        ),
    },
];
function ReportPage() {
    const { data: monthData, isLoading: isLoadingMonth } = useQuery({
        queryKey: ["month"],
        queryFn: async () => {
            try {
                const response = await fetchMonthPayments();

                if (!response?.data || response.data.length === 0) {
                    return { data: [] };
                }

                const data = response.data
                    // primeiro ordena na ordem correta para o acumulado
                    .slice()
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    // depois calcula o total acumulado
                    .reduce<{ total: number; items: any[] }>(
                        (acc, item) => {
                            const net = item.total_value_credit - item.total_value_debit;

                            const total = acc.total + net;

                            acc.items.push({
                                ...item,
                                total,
                                dateTimestamp: new Date(item.date).getTime(),
                            });

                            acc.total = total;
                            return acc;
                        },
                        { total: 0, items: [] },
                    )
                    .items // por fim, ordena como quiser exibir
                    .sort((a, b) => {
                        if (b.dateTimestamp !== a.dateTimestamp) {
                            return b.dateTimestamp - a.dateTimestamp;
                        }
                        return b.id - a.id;
                    });

                return { data };
            } catch (error) {
                console.error("Erro ao buscar pagamentos:", error);
                return { data: [] };
            }
        },
    });

    return (
        <>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Overview" }]}
            />
            <Layout>
                <Flex align="center" vertical gap={"8px"}>
                    <Table
                        className={styles["table"]}
                        columns={headerTableFinancial}
                        dataSource={monthData?.data}
                        loading={isLoadingMonth}
                        summary={(paymentData) => <TableSummary paymentData={paymentData} />}
                        pagination={false}
                        style={{
                            borderRadius: "20px",
                        }}
                        bordered
                    />
                </Flex>
            </Layout>
        </>
    );
}

function TableSummary({ paymentData }: { paymentData: readonly IPaymentMonth[] }) {
    const { Text } = Typography;

    let totalCredit = 0;
    let totalDebit = 0;
    let totalClosed = 0;
    let totalOpen = 0;
    let totalPayments = 0;
    paymentData.forEach((payment) => {
        totalCredit = totalCredit + payment.total_value_credit;
        totalDebit = totalDebit + payment.total_value_debit;
        totalOpen = totalOpen + payment.total_value_open;
        totalClosed = totalClosed + payment.total_value_closed;
        totalPayments = totalPayments + payment.total_payments;
    });

    return (
        <>
            <Table.Summary.Row>
                <Table.Summary.Cell index={1} colSpan={2}>
                    <Text strong>Totais:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                    <Tag color="green">+{formatMoney(totalCredit)}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                    <Tag color="volcano">-{formatMoney(totalDebit)}</Tag>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

export default ReportPage;
