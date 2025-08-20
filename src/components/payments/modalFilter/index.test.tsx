import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ModalFilter from "./index";
import userEvent from "@testing-library/user-event";

describe("ModalFilter Component", () => {
    const mockOnCancel = jest.fn();
    const mockSetFilters = jest.fn();

    const defaultProps = {
        visible: true,
        onCancel: mockOnCancel,
        setFilters: mockSetFilters,
    };

    const setup = (props = defaultProps) => {
        render(<ModalFilter {...props} />);
    };

    test("should render the modal with correct title", () => {
        setup();
        expect(screen.getByText("Filtro")).toBeInTheDocument();
    });

    test("should call onCancel when cancel button is clicked", () => {
        setup();
        fireEvent.click(screen.getByText("Cancel"));
        expect(mockOnCancel).toHaveBeenCalled();
    });

    test("should call setFilters when form is submitted", async () => {
        setup();
        fireEvent.click(screen.getByText("OK"));
        await waitFor(() => {
            expect(mockSetFilters).toHaveBeenCalled();
        });
    });

    test("should render all form fields", () => {
        setup();
        expect(screen.getByLabelText("Status")).toBeInTheDocument();
        expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Data")).toBeInTheDocument();
        expect(screen.getByLabelText("Parcelas")).toBeInTheDocument();
        expect(screen.getByLabelText("Dia de pagamento")).toBeInTheDocument();
        expect(screen.getByLabelText("Valor")).toBeInTheDocument();
        expect(screen.getByLabelText("Entrada mensal")).toBeInTheDocument();
        expect(screen.getByLabelText("Ativo")).toBeInTheDocument();
    });

    test("should render the correct options for status select", () => {
        setup();
        fireEvent.mouseDown(screen.getByLabelText("Status"));
        expect(screen.getByText("Todos")).toBeInTheDocument();
        expect(screen.getByText("Em aberto")).toBeInTheDocument();
        expect(screen.getByText("Baixado")).toBeInTheDocument();
    });

    test("should render the correct options for type select", () => {
        setup();
        fireEvent.mouseDown(screen.getByLabelText("Tipo"));
        expect(screen.getByText("Todos")).toBeInTheDocument();
        expect(screen.getByText("Credito")).toBeInTheDocument();
        expect(screen.getByText("Debito")).toBeInTheDocument();
    });

    test("should render the correct options for fixed select", () => {
        setup();
        fireEvent.mouseDown(screen.getByLabelText("Entrada mensal"));
        expect(screen.getByText("Todos")).toBeInTheDocument();
        expect(screen.getByText("Sim")).toBeInTheDocument();
        expect(screen.getByText("Não")).toBeInTheDocument();
    });

    test("should render the correct options for active select", () => {
        setup();
        fireEvent.mouseDown(screen.getByLabelText("Ativo"));
        expect(screen.getByText("Todos")).toBeInTheDocument();
        expect(screen.getByText("Sim")).toBeInTheDocument();
        expect(screen.getByText("Não")).toBeInTheDocument();
    });
});
