"use client";
import { Breadcrumb, DatePicker, Layout, Select, Table, Typography } from "antd";
import dayjs from "dayjs";

import { formatMoney } from "@/util";

import Goals from "@/components/budget/goals";
import { useBudget } from "@/components/providers/budget";

import styles from "./budget.module.scss";

const { Title } = Typography;
const { Option } = Select;

const BudgetPage = () => {
    const { changePeriodFilter, isLoading, data, periodFilter } = useBudget();

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item href="/">Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Orçamento</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Orçamento doméstico
                    </Title>
                </div>
                <div className={styles.title}>
                    Controle seu orçamento doméstico com base em suas próprias metas e rendimentos.
                </div>
                <div>
                    Visualizar gastos de:
                    <span>
                        <DatePicker
                            format="MM/YYYY"
                            picker="month"
                            disabled={isLoading}
                            onChange={changePeriodFilter}
                            defaultValue={periodFilter ? dayjs(periodFilter, "MM/YYYY") : null}
                        />
                        {/* <Select
                            defaultValue={"yesterday"}
                            disabled={isLoading}
                            // style={{ padding: "0", width: "100%" }}
                            onChange={changePeriodFilter}
                        >
                            <Option className={`${styles["select-option"]} `} value={"current_day"}>
                                {"hoje"}
                            </Option>
                            <Option className={`${styles["select-option"]} `} value={"yesterday"}>
                                {"ontem"}
                            </Option>
                            <Option className={`${styles["select-option"]} `} value={"weekly"}>
                                {"últimos 7 dias"}
                            </Option>
                            <Option className={`${styles["select-option"]} `} value={"current"}>
                                {"mês atual"}
                            </Option>
                            <Option className={`${styles["select-option"]} `} value={"last_month"}>
                                {"mês passado"}
                            </Option>
                            <Option className={`${styles["select-option"]} `} value={"30"}>
                                {"últimos 30 dias"}
                            </Option>
                            <Option className={`${styles["select-option"]} `} value={"60"}>
                                {"últimos 60 dias"}
                            </Option>
                        </Select> */}
                    </span>
                </div>
                <Table
                    pagination={false}
                    columns={[
                        { title: "Orçamento", dataIndex: "name", key: "name" },
                        {
                            title: "Estimativa de Gastos",
                            dataIndex: "estimated_expense",
                            key: "estimated_expense",
                            render: (value: any) => formatMoney(value),
                        },
                        {
                            title: "Gastos Reais",
                            dataIndex: "actual_expense",
                            key: "actual_expense",
                            render: (value: any) => formatMoney(value),
                        },
                        {
                            title: "Diferença",
                            dataIndex: "difference",
                            key: "difference",
                            render(_, record) {
                                const difference = record.estimated_expense - record.actual_expense;
                                return (
                                    <span style={{ color: difference < 0 ? "red" : "green" }}>
                                        {formatMoney(difference)}
                                    </span>
                                );
                            },
                        },
                    ]}
                    dataSource={data}
                />
                <Goals />
            </Layout>
        </>
    );
};

export default BudgetPage;
