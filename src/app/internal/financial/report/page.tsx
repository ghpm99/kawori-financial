"use client";

import { Card, Empty, Layout } from "antd";

import { useReport } from "@/components/providers/report";

import {
    ReportCharts,
    ReportError,
    ReportFilters,
    ReportHeader,
    ReportInsights,
    ReportMonthlyHistory,
    ReportStats,
} from "./components";
import styles from "./Overview.module.scss";

export default function ReportPage() {
    const { hasAnyData, isLoadingPage } = useReport();

    return (
        <div className={styles.wrapper}>
            <Layout>
                <ReportHeader />
                <ReportFilters />
                <ReportError />
                <ReportStats />

                {!isLoadingPage && !hasAnyData ? (
                    <Card>
                        <Empty description="Nao ha dados para o periodo selecionado." />
                    </Card>
                ) : null}

                <ReportCharts />
                <ReportInsights />
                <ReportMonthlyHistory />
            </Layout>
        </div>
    );
}
