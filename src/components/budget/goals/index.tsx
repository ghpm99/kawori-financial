import { Alert, Button, Card } from "antd";

import { useBudget } from "@/components/providers/budget";

import AddBudgetGoal from "./addBudget";
import BudgetItem from "./budgetItem";

const Goals = () => {
    const { budgets, updateBudgetAmount, feedbackMessage, enabledSave } = useBudget();
    return (
        <Card title="Metas">
            {feedbackMessage.msg && <Alert message={feedbackMessage.msg} type={feedbackMessage.type} showIcon />}
            {budgets.map((budget) => (
                <BudgetItem
                    key={budget.id}
                    item={budget}
                    handleChangeAmount={(amount) => updateBudgetAmount(budget.id, amount)}
                />
            ))}
            <AddBudgetGoal />
            <Button disabled={!enabledSave}>Salvar</Button>
        </Card>
    );
};

export default Goals;
