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

import { formatMoney } from "@/util/index";

import Cards from "@/components/overview/cards";
import InvoiceByTag from "@/components/overview/invoiceByTag";
import PaymentFixed from "@/components/overview/paymentFixed";
import PaymentWithFixed from "@/components/overview/paymentWithFixed";
import AccumulatedValue from "@/components/overview/paymentWithoutFixed";

import { IPaymentMonth, useReport } from "@/components/providers/report";
import { useTheme } from "@/components/providers/themeProvider/themeContext";
import { ColumnType } from "antd/lib/table/interface";
import styles from "./Overview.module.scss";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const headerTableFinancial: ColumnType<IPaymentMonth>[] = [
    {
        title: "ID",
        dataIndex: "id",
        key: "id",
    },
    {
        title: "Nome",
        dataIndex: "name",
        key: "name",
    },
    {
        title: "Total",
        dataIndex: "total_value_credit",
        key: "total_value_credit",
        render: (_: string, record: IPaymentMonth) => {
            const credit = formatMoney(record.total_value_credit ?? 0);
            const debit = formatMoney(record.total_value_debit ?? 0);
            return (
                <div>
                    <Tag color="green">+{credit}</Tag>
                    <Tag color="volcano">-{debit}</Tag>
                </div>
            );
        },
    },
    {
        title: "Total em aberto",
        dataIndex: "total_value_open",
        key: "total_value_open",
        render: (value: number) => (value ? formatMoney(value) : ""),
    },
    {
        title: "Total baixado",
        dataIndex: "total_value_closed",
        key: "total_value_closed",
        render: (value: number) => (value ? formatMoney(value) : ""),
    },
    {
        title: "Totais de pagamentos",
        dataIndex: "total_payments",
        key: "total_payments",
    },
];
function ReportPage() {
    const { month, payments, invoiceByTag, amountForecastValue, fixed_credit, fixed_debit } = useReport();
    const {
        state: { theme },
    } = useTheme();
    console.log(month);
    return (
        <>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Overview" }]}
            />
            <Layout>
                <Flex align="center" vertical gap={"8px"}>
                    <Cards />
                    <Table
                        className={styles["table"]}
                        columns={headerTableFinancial}
                        dataSource={month.data}
                        loading={month.isLoading}
                        summary={(paymentData) => <TableSummary paymentData={paymentData} />}
                        pagination={false}
                        style={{
                            borderRadius: "20px",
                        }}
                        bordered
                    />
                    <PaymentWithFixed theme={theme} data={payments.data} />
                    <InvoiceByTag theme={theme} data={invoiceByTag.data} />
                    <AccumulatedValue
                        theme={theme}
                        payments={payments.data}
                        amountForecastValue={amountForecastValue.data}
                    />
                    <PaymentFixed theme={theme} fixedCredit={fixed_credit.data} fixedDebit={fixed_debit.data} />
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
                    <Tag color="volcano">-{formatMoney(totalDebit)}</Tag>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                    <Text strong>{formatMoney(totalOpen)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5}>
                    <Text strong>{formatMoney(totalClosed)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6}>
                    <Text strong>{totalPayments}</Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

export default ReportPage;
