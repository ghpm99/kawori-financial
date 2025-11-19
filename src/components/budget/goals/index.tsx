import { Alert, Button, Card, Typography } from "antd";

import { useBudget } from "@/components/providers/budget";

import AddBudgetGoal from "./addBudget";
import BudgetItem from "./budgetItem";
import styles from "./goals.module.scss";

const { Title } = Typography;

const Goals = () => {
    const {
        budgets,
        updateBudgetAllocationPercentage,
        feedbackMessage,
        enabledSave,
        totalAmount,
        saveBudgets,
        resetBudgets,
    } = useBudget();
    return (
        <div className={styles["container"]}>
            <Card
                title={
                    <Title level={4} style={{ margin: "0" }}>
                        Editar Metas
                    </Title>
                }
            >
                {feedbackMessage.msg && (
                    <Alert
                        className={styles["alert"]}
                        message={feedbackMessage.msg}
                        type={feedbackMessage.type}
                        showIcon
                    />
                )}
                {budgets.map((budget) => (
                    <BudgetItem
                        key={budget.id}
                        item={budget}
                        handleChangeAllocationPercentage={(allocationPercentage) =>
                            updateBudgetAllocationPercentage(budget.id, allocationPercentage)
                        }
                    />
                ))}
                <div className={styles["footer"]}>
                    <div>Total do orçamento: {totalAmount}%</div>
                    <div className={styles["button-group"]}>
                        <Button danger onClick={resetBudgets}>
                            Redefinir
                        </Button>
                        <Button type="primary" disabled={!enabledSave} onClick={saveBudgets}>
                            Salvar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default Goals;
