import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ModalPayoff, { ITableDataSource } from "./index";

describe("ModalPayoff Component", () => {
    const mockOnCancel = jest.fn();
    const mockOnPayoff = jest.fn();
    const mockData: ITableDataSource[] = [
        { status: 0, id: 1, description: "Payment 1" },
        { status: 1, id: 2, description: "Payment 2" },
        { status: 2, id: 3, description: "Payment 3" },
        { status: 3, id: 4, description: "Payment 4" },
    ];

    test("should render the modal with correct title and buttons", () => {
        render(<ModalPayoff visible={true} onCancel={mockOnCancel} onPayoff={mockOnPayoff} data={mockData} />);

        expect(screen.getByText("Baixar pagamentos")).toBeInTheDocument();
        expect(screen.getByText("Voltar")).toBeInTheDocument();
        expect(screen.getByText("Processar")).toBeInTheDocument();
    });

    test("should call onCancel when the 'Voltar' button is clicked", () => {
        render(<ModalPayoff visible={true} onCancel={mockOnCancel} onPayoff={mockOnPayoff} data={mockData} />);

        fireEvent.click(screen.getByText("Voltar"));
        expect(mockOnCancel).toHaveBeenCalled();
    });

    test("should call onPayoff when the 'Processar' button is clicked", () => {
        render(<ModalPayoff visible={true} onCancel={mockOnCancel} onPayoff={mockOnPayoff} data={mockData} />);

        fireEvent.click(screen.getByText("Processar"));
        expect(mockOnPayoff).toHaveBeenCalled();
    });
});
