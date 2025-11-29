import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import TagDrawer from ".";
import { ITags } from "@/components/providers/tags";

const mockTagDetail: ITags = {
    id: 1,
    name: "Teste Tag",
    color: "#ff0000",
    total_payments: 0,
    total_value: 0,
    total_open: 0,
    total_closed: 0,
    is_budget: false,
};

const mockOnClose = jest.fn();
const mockOnUpdateTagDetail = jest.fn();

const defaultProps = {
    open: true,
    onClose: mockOnClose,
    onUpdateTagDetail: mockOnUpdateTagDetail,
    tagDetails: undefined,
    isLoading: false,
};

describe("TagDrawer", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("1. Renderiza como 'Nova Tag' quando não há tagDetails", () => {
        render(<TagDrawer {...defaultProps} />);

        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("Nova Tag")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Salvar/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Cancelar/i })).toBeInTheDocument();
    });

    it("2. Renderiza título de edição quando há tagDetails", () => {
        render(<TagDrawer {...defaultProps} tagDetails={mockTagDetail} />);
        expect(screen.getByText("Tag #1")).toBeInTheDocument();
    });

    it("3. Preenche o formulário quando tagDetails é informado", async () => {
        render(<TagDrawer {...defaultProps} tagDetails={mockTagDetail} />);
        await waitFor(() => {
            expect(screen.getByTestId("tag-name")).toHaveValue(mockTagDetail.name);
            expect(screen.getByTestId("tag-color")).toHaveValue(mockTagDetail.color);
        });
    });

    it("4. Reset do formulário quando fechar e abrir novamente sem tagDetails", async () => {
        const { rerender } = render(<TagDrawer {...defaultProps} tagDetails={mockTagDetail} open={true} />);

        await waitFor(() => {
            expect(screen.getByTestId("tag-name")).toHaveValue("Teste Tag");
        });

        rerender(<TagDrawer {...defaultProps} tagDetails={mockTagDetail} open={false} />);

        rerender(<TagDrawer {...defaultProps} tagDetails={undefined} open={true} />);

        await waitFor(() => {
            expect(screen.getByTestId("tag-name")).toHaveValue("");
        });
    });

    it("5. Chama onClose ao clicar em Cancelar", () => {
        render(<TagDrawer {...defaultProps} />);
        fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("6. Submissão — chama onClose e onUpdateTagDetail com dados do formulário", async () => {
        render(<TagDrawer {...defaultProps} open={true} />);

        const newTagName = "Nova Tag Nome";
        const newTagColor = "#0000ff";

        fireEvent.change(screen.getByTestId("tag-name"), {
            target: { value: newTagName },
        });
        fireEvent.change(screen.getByTestId("tag-color"), {
            target: { value: newTagColor },
        });

        fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

        await waitFor(() => {
            expect(mockOnUpdateTagDetail).toHaveBeenCalledTimes(1);
            expect(mockOnUpdateTagDetail).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: newTagName,
                    color: newTagColor,
                }),
            );
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });
});
