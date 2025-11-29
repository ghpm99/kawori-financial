import { render, screen, fireEvent } from "@testing-library/react";
import FilterDropdown from "./Index";

describe("FilterDropdown Component", () => {
    test("renderiza os children corretamente", () => {
        render(
            <FilterDropdown applyFilter={jest.fn()}>
                <div data-testid="child-element">Conteúdo interno</div>
            </FilterDropdown>,
        );

        expect(screen.getByTestId("child-element")).toBeInTheDocument();
        expect(screen.getByText("Conteúdo interno")).toBeInTheDocument();
    });

    test("renderiza o botão 'Aplicar'", () => {
        render(<FilterDropdown applyFilter={jest.fn()}>Item</FilterDropdown>);

        const button = screen.getByRole("button", { name: "Aplicar" });
        expect(button).toBeInTheDocument();
    });

    test("chama applyFilter ao clicar no botão", () => {
        const mockFn = jest.fn();

        render(<FilterDropdown applyFilter={mockFn}>Item</FilterDropdown>);

        const button = screen.getByRole("button", { name: "Aplicar" });
        fireEvent.click(button);

        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});
