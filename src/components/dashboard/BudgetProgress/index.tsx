import { Card, Col, Progress } from "antd";
import styles from "./BudgetProgress.module.scss";
const BudgetProgress = () => {
    return (
        <Col xs={24} lg={12}>
            <Card title="Resumo do Mês" className={styles.summaryCard}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Orçamento Planejado</span>
                    <span className={styles.summaryValue}>R$ 4.500</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Gasto Atual</span>
                    <span className={styles.summaryValue}>R$ 3.200</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Restante</span>
                    <span className={`${styles.summaryValue} ${styles.positive}`}>R$ 1.300</span>
                </div>
                <div className={styles.summaryProgress}>
                    <Progress percent={71} strokeColor="#52c41a" format={() => "71% do orçamento usado"} />
                </div>
            </Card>
        </Col>
    );
};

export default BudgetProgress;
