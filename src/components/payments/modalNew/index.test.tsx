import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ModalNew from "./index";

describe("ModalNew Component", () => {
    const mockOnCancel = jest.fn();
    const mockOnFinish = jest.fn();

    const defaultProps = {
        visible: true,
        onCancel: mockOnCancel,
        onFinish: mockOnFinish,
    };

    beforeEach(() => {
        render(<ModalNew {...defaultProps} />);
    });

    test("renders the modal with correct title", () => {
        expect(screen.getByText("Nova entrada")).toBeInTheDocument();
    });

    test("renders all form fields", () => {
        expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Data")).toBeInTheDocument();
        expect(screen.getByLabelText("Parcelas")).toBeInTheDocument();
        expect(screen.getByLabelText("Dia de pagamento")).toBeInTheDocument();
        expect(screen.getByLabelText("Valor")).toBeInTheDocument();
        expect(screen.getByLabelText("Entrada mensal")).toBeInTheDocument();
    });

    test("calls onCancel when cancel button is clicked", () => {
        fireEvent.click(screen.getByText("Cancel"));
        expect(mockOnCancel).toHaveBeenCalled();
    });

    test.skip("calls onFinish when form is submitted", () => {
        fireEvent.change(screen.getByPlaceholderText("Digite o nome"), { target: { value: "Test Name" } });
        fireEvent.change(screen.getByPlaceholderText("Selecione o tipo de entrada"), { target: { value: 0 } });
        fireEvent.change(screen.getByPlaceholderText("Digite o valor"), { target: { value: 100 } });
        fireEvent.click(screen.getByText("OK"));
        expect(mockOnFinish).toHaveBeenCalled();
    });

    test("validates required fields", async () => {
        fireEvent.click(screen.getByText("OK"));
        expect(await screen.findByText("Selecione o tipo de entrada")).toBeInTheDocument();
        expect(await screen.findByText("Entre com o nome da entrada")).toBeInTheDocument();
        expect(await screen.findByText("Selecione a data da entrada")).toBeInTheDocument();
        expect(await screen.findByText("Digite o numero de parcelas")).toBeInTheDocument();
        expect(await screen.findByText("Selecione a data do pagamento")).toBeInTheDocument();
        expect(await screen.findByText("Digite o valor")).toBeInTheDocument();
    });
});
