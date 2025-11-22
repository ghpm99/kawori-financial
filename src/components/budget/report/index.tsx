import { DatePicker, Table, Typography } from "antd";
import dayjs from "dayjs";

import { formatMoney } from "@/util";

import { useBudget } from "@/components/providers/budget";

import styles from "./report.module.scss";

const { Title } = Typography;

const Report = () => {
    const { changePeriodFilter, isLoading, data, periodFilter } = useBudget();

    const renderPercent = (percent: number) => {
        if (isNaN(percent) || !isFinite(percent)) {
            return <span className={styles["positive"]}>0%</span>;
        }
        return (
            <span className={percent > 1 ? styles["negative"] : styles["positive"]}>
                {(percent * 100).toFixed(2) + "%"}
            </span>
        );
    };

    return (
        <div className={styles["container"]}>
            <Table
                bordered
                style={{ marginBottom: "8px" }}
                title={() => (
                    <div className={styles["table-header"]}>
                        <Title level={4} style={{ margin: "0" }}>
                            Resumo
                        </Title>
                        <span>
                            Visualizar gastos de:
                            <DatePicker
                                style={{ marginLeft: 8 }}
                                variant="underlined"
                                format="MM/YYYY"
                                picker="month"
                                disabled={isLoading}
                                onChange={changePeriodFilter}
                                defaultValue={periodFilter ? periodFilter : null}
                            />
                        </span>
                    </div>
                )}
                pagination={false}
                columns={[
                    { title: "Orçamento", dataIndex: "name", key: "name" },
                    {
                        title: "Valor Gasto",
                        dataIndex: "actual_expense",
                        key: "actual_expense",
                        render: (value: number, record) => (
                            <span
                                className={
                                    record.actual_expense > record.estimated_expense
                                        ? styles["negative"]
                                        : styles["positive"]
                                }
                            >
                                {formatMoney(value)}
                            </span>
                        ),
                    },
                    {
                        title: "Devo Gastar",
                        dataIndex: "estimated_expense",
                        key: "estimated_expense",
                        render: (value: number) => formatMoney(value),
                    },
                    {
                        title: "Utilizado",
                        dataIndex: "difference",
                        key: "difference",
                        render(_, record) {
                            const percentAlreadyUsed = record.actual_expense / record.estimated_expense;
                            return renderPercent(percentAlreadyUsed);
                        },
                    },
                ]}
                dataSource={data}
                summary={(pageData) => {
                    let totalEstimatedExpense = 0;
                    let totalExpense = 0;

                    pageData.forEach(({ estimated_expense, actual_expense }) => {
                        totalEstimatedExpense += estimated_expense;
                        totalExpense += actual_expense;
                    });

                    const percentAlreadyUsed = totalExpense / totalEstimatedExpense;

                    return (
                        <Table.Summary.Row className={styles["table-summary"]}>
                            <Table.Summary.Cell index={0}>Total</Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                                <span
                                    className={
                                        totalExpense > totalEstimatedExpense ? styles["negative"] : styles["positive"]
                                    }
                                >
                                    {formatMoney(totalExpense)}
                                </span>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2}>{formatMoney(totalEstimatedExpense)}</Table.Summary.Cell>
                            <Table.Summary.Cell index={3}>{renderPercent(percentAlreadyUsed)}</Table.Summary.Cell>
                        </Table.Summary.Row>
                    );
                }}
            />
        </div>
    );
};

export default Report;
