import { Card, Col, Row, Statistic } from "antd";

import { useReport } from "@/components/providers/report";
import { formatMoney } from "@/util";

import styles from "../Overview.module.scss";

export function ReportStats() {
    const { isLoadingPage, kpis } = useReport();

    return (
        <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Receitas" value={formatMoney(kpis.revenues)} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Despesas" value={formatMoney(kpis.expenses)} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Resultado liquido" value={formatMoney(kpis.profit)} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Crescimento" value={kpis.growth} suffix="%" />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Taxa de poupanca" value={kpis.savingsRate} suffix="%" />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Ticket medio" value={formatMoney(kpis.averageTicket)} />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Em aberto" value={kpis.openShare} suffix="%" />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
                <Card loading={isLoadingPage}>
                    <Statistic title="Fechados" value={kpis.closedShare} suffix="%" />
                </Card>
            </Col>
        </Row>
    );
}
