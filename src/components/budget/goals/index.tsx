import { Alert, Button, Card } from "antd";

import { useBudget } from "@/components/providers/budget";

import AddBudgetGoal from "./addBudget";
import BudgetItem from "./budgetItem";
import styles from "./goals.module.scss";

const Goals = () => {
    const { budgets, updateBudgetAllocationPercentage, feedbackMessage, enabledSave, totalAmount, saveBudgets } =
        useBudget();
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
                <Button type="primary" disabled={!enabledSave} onClick={saveBudgets}>
                    Salvar
                </Button>
            </div>
        </Card>
    );
};

export default Goals;
