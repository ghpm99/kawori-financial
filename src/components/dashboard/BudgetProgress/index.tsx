import { Card, Col, Progress } from "antd";
import styles from "./BudgetProgress.module.scss";
import type { BudgetProgress } from "@/components/providers/dashboard";
const BudgetProgress = ({ data, isLoading }: BudgetProgress) => {
    const calculatedPercent = (estimatedExpense: number, actualExpense: number) => {
        const percentAlreadyUsed = estimatedExpense > 0 ? actualExpense / estimatedExpense : 0;
        if (isNaN(percentAlreadyUsed) || !isFinite(percentAlreadyUsed)) {
            return 0;
        }
        return Math.round(percentAlreadyUsed * 100);
    };
    return (
        <Col xs={24} lg={12}>
            <Card title="Resumo do Mês" className={styles.summaryCard} loading={isLoading}>
                {data.map((budget) => (
                    <div key={budget.id} className={styles.summaryItem}>
                        <span className={styles.summaryLabel}>{budget.name}</span>
                        <span className={styles.summaryValue}>
                            <Progress
                                percent={calculatedPercent(budget.estimated_expense, budget.actual_expense)}
                                strokeColor={budget.color}
                            />
                        </span>
                    </div>
                ))}
            </Card>
        </Col>
    );
};

export default BudgetProgress;
