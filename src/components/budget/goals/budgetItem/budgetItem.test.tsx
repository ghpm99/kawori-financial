import { render, screen, fireEvent } from "@testing-library/react";
import BudgetItem from ".";
import { IBudget } from "@/components/providers/budget";

jest.mock("antd", () => {
    const original = jest.requireActual("antd");
    return {
        ...original,
        Slider: ({ onChange, value, styles }: any) => (
            <input
                data-testid="slider"
                type="range"
                value={value}
                style={styles?.track}
                onChange={(e) => onChange(Number(e.target.value))}
            />
        ),
    };
});

describe("BudgetItem", () => {
    const item: IBudget = {
        id: 1,
        name: "Alimentação",
        allocation_percentage: 30,
        color: "#ff0000",
        estimated_expense: 100,
        actual_expense: 50,
        difference: 50,
    };

    test("renderiza o nome do item", () => {
        render(<BudgetItem item={item} handleChangeAllocationPercentage={() => {}} />);
        expect(screen.getByText("Alimentação")).toBeInTheDocument();
    });

    test("exibe o valor no InputNumber com %", () => {
        render(<BudgetItem item={item} handleChangeAllocationPercentage={() => {}} />);
        expect(screen.getByDisplayValue("30%")).toBeInTheDocument();
    });

    test("InputNumber chama handleChangeAllocationPercentage", () => {
        const handleChange = jest.fn();
        render(<BudgetItem item={item} handleChangeAllocationPercentage={handleChange} />);

        const input = screen.getByDisplayValue("30%");
        fireEvent.change(input, { target: { value: "45%" } });

        expect(handleChange).toHaveBeenCalledWith(45);
    });

    test("Slider exibe o valor inicial", () => {
        render(<BudgetItem item={item} handleChangeAllocationPercentage={() => {}} />);
        const slider = screen.getByTestId("slider");
        expect(slider).toHaveValue("30");
    });

    test("Slider chama handleChangeAllocationPercentage ao alterar valor", () => {
        const handleChange = jest.fn();
        render(<BudgetItem item={item} handleChangeAllocationPercentage={handleChange} />);

        const slider = screen.getByTestId("slider");
        fireEvent.change(slider, { target: { value: "60" } });

        expect(handleChange).toHaveBeenCalledWith(60);
    });

    test("aplica a cor no track do slider", () => {
        render(<BudgetItem item={item} handleChangeAllocationPercentage={() => {}} />);
        const slider = screen.getByTestId("slider");
        expect(slider.style.background).toBe("rgb(255, 0, 0)");
    });
});
