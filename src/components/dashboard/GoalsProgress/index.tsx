import { Card, Col, Progress } from "antd";
import styles from "./GoalsProgress.module.scss";

const GoalsProgress = () => {
    return (
        <Col xs={24} lg={12}>
            <Card title="Metas de Economia" className={styles.goalsCard}>
                <div>Em breve</div>
                {/* <div className={styles.goalItem}>
                    <div className={styles.goalHeader}>
                        <span>Viagem de Férias</span>
                        <span>R$ 3.500 / R$ 5.000</span>
                    </div>
                    <Progress percent={70} strokeColor="#52c41a" />
                </div>
                <div className={styles.goalItem}>
                    <div className={styles.goalHeader}>
                        <span>Emergência</span>
                        <span>R$ 2.800 / R$ 10.000</span>
                    </div>
                    <Progress percent={28} strokeColor="#faad14" />
                </div>
                <div className={styles.goalItem}>
                    <div className={styles.goalHeader}>
                        <span>Novo Carro</span>
                        <span>R$ 8.200 / R$ 25.000</span>
                    </div>
                    <Progress percent={33} strokeColor="#1890ff" />
                </div> */}
            </Card>
        </Col>
    );
};

export default GoalsProgress;
