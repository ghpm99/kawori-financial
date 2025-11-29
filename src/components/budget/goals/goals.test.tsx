import { render, screen, fireEvent } from "@testing-library/react";

import BudgetItem from "./budgetItem";
import Goals from ".";

jest.mock("./budgetItem", () => jest.fn(() => <div data-testid="budget-item" />));

const mockUseBudget = jest.fn();

jest.mock("@/components/providers/budget", () => ({
    useBudget: () => mockUseBudget(),
}));

describe("Goals Component", () => {
    const baseState = {
        budgets: [
            { id: 1, name: "Alimentação", allocation_percentage: 30, color: "#f00" },
            { id: 2, name: "Transporte", allocation_percentage: 20, color: "#0f0" },
        ],
        updateBudgetAllocationPercentage: jest.fn(),
        feedbackMessage: { msg: "", type: "success" },
        enabledSave: false,
        totalAmount: 50,
        saveBudgets: jest.fn(),
        resetBudgets: jest.fn(),
    };

    beforeEach(() => {
        mockUseBudget.mockReturnValue({ ...baseState });
        jest.clearAllMocks();
    });

    test("renderiza o título 'Editar Metas'", () => {
        render(<Goals />);
        expect(screen.getByText("Editar Metas")).toBeInTheDocument();
    });

    test("renderiza a lista de budgets", () => {
        render(<Goals />);
        const items = screen.getAllByTestId("budget-item");
        expect(items.length).toBe(2);
    });

    test("BudgetItem recebe handler que chama updateBudgetAllocationPercentage corretamente", () => {
        // mock para capturar props do BudgetItem
        const budgetItemMock = jest.requireMock("./budgetItem");

        render(<Goals />);

        expect(budgetItemMock).toHaveBeenCalledTimes(2);

        const call = budgetItemMock.mock.calls[0][0];

        // simula alteração
        call.handleChangeAllocationPercentage(60);

        expect(baseState.updateBudgetAllocationPercentage).toHaveBeenCalledWith(1, 60);
    });

    test("exibe mensagem de feedback quando existe", () => {
        mockUseBudget.mockReturnValue({
            ...baseState,
            feedbackMessage: { msg: "Erro ao salvar", type: "error" },
        });

        render(<Goals />);

        expect(screen.getByText("Erro ao salvar")).toBeInTheDocument();
    });

    test("exibe o total do orçamento", () => {
        render(<Goals />);
        expect(screen.getByText("Total do orçamento: 50%")).toBeInTheDocument();
    });

    test("botão 'Salvar' fica desabilitado quando enabledSave = false", () => {
        render(<Goals />);
        const saveBtn = screen.getByRole("button", { name: "Salvar" });

        expect(saveBtn).toHaveAttribute("aria-disabled", "true");
    });

    test("botão 'Salvar' fica habilitado quando enabledSave = true", () => {
        mockUseBudget.mockReturnValue({
            ...baseState,
            enabledSave: true,
        });

        render(<Goals />);
        const saveBtn = screen.getByText("Salvar");
        expect(saveBtn).toBeEnabled();
    });

    test("botão 'Salvar' chama saveBudgets", () => {
        mockUseBudget.mockReturnValue({
            ...baseState,
            enabledSave: true,
        });

        render(<Goals />);
        const saveBtn = screen.getByText("Salvar");

        fireEvent.click(saveBtn);

        expect(baseState.saveBudgets).toHaveBeenCalledTimes(1);
    });

    test("botão 'Redefinir' chama resetBudgets", () => {
        render(<Goals />);
        const resetBtn = screen.getByText("Redefinir");

        fireEvent.click(resetBtn);

        expect(baseState.resetBudgets).toHaveBeenCalledTimes(1);
    });
});
