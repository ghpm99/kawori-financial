"use client";

import BudgetProgress from "@/components/dashboard/BudgetProgress";
import GoalsProgress from "@/components/dashboard/GoalsProgress";
import InvoiceByTagChart from "@/components/dashboard/InvoiceByTagChart";
import InvoicesSection from "@/components/dashboard/InvoicesSection";
import DashboardMetrics from "@/components/dashboard/Metrics";
import PaymentsChart from "@/components/dashboard/PaymentsChart";
import { useDashboard } from "@/components/providers/dashboard";
import { Breadcrumb, Layout, Row } from "antd";
import styles from "./Dashboard.module.scss";

const DashBoardPage = () => {
    const { revenues, expenses, profit, growth, paymentsChart, invoiceByTag, budgetsData } = useDashboard();

    return (
        <>
            <Breadcrumb
                className={styles.breadcrumb}
                items={[{ title: "Kawori" }, { title: "Financeiro" }, { title: "Dashboard" }]}
            />
            <Layout>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Dashboard Financeiro</h1>
                        <p className={styles.subtitle}>Visão geral das suas finanças</p>
                    </div>

                    {/* Métricas Principais */}
                    <DashboardMetrics revenues={revenues} expenses={expenses} profit={profit} growth={growth} />

                    {/* Gráficos */}
                    <Row gutter={[24, 24]} className={styles.chartsRow}>
                        <PaymentsChart paymentsChart={paymentsChart} />
                        <InvoiceByTagChart invoiceByTag={invoiceByTag} />
                    </Row>

                    {/* Metas de Economia */}
                    <Row gutter={[24, 24]} className={styles.goalsRow}>
                        <GoalsProgress />
                        <BudgetProgress {...budgetsData} />
                    </Row>

                    {/* Transações Recentes */}
                    <Row gutter={[24, 24]} className={styles.transactionsRow}>
                        <InvoicesSection
                            title="Notas vencidas"
                            filters={{
                                page: 1,
                                page_size: 3,
                                payment_date__lte: "2025-12-08",
                            }}
                        />

                        <InvoicesSection
                            title="Notas a vencer"
                            filters={{
                                page: 1,
                                page_size: 3,
                                payment_date__lte: "2025-12-09",
                                payment_date__gte: "2025-12-08",
                            }}
                        />

                        <InvoicesSection
                            title="Notas futuras"
                            filters={{
                                page: 1,
                                page_size: 3,
                                payment_date__gte: "2025-12-09",
                            }}
                        />
                    </Row>
                </div>
            </Layout>
        </>
    );
};

export default DashBoardPage;
