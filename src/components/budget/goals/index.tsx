import { Alert, Button, Card } from "antd";

import { useBudget } from "@/components/providers/budget";

import AddBudgetGoal from "./addBudget";
import BudgetItem from "./budgetItem";
import styles from "./goals.module.scss";

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
        <Card title="Metas">
            {feedbackMessage.msg && <Alert message={feedbackMessage.msg} type={feedbackMessage.type} showIcon />}
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
                Total do orçamento: {totalAmount}%
                <div>
                    <Button danger onClick={resetBudgets}>
                        Resetar
                    </Button>
                    <Button type="primary" disabled={!enabledSave} onClick={saveBudgets}>
                        Salvar
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default Goals;
