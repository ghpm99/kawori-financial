import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ModalNewInvoice, { IModalNewInvoiceProps } from "./index";

const mockTags: ITags[] = [
    { id: 1, name: "Tag1", color: "" },
    { id: 2, name: "Tag2", color: "" },
];

const defaultProps: IModalNewInvoiceProps = {
    visible: true,
    onCancel: jest.fn(),
    onFinish: jest.fn(),
    tags: mockTags,
};

describe("ModalNewInvoice", () => {
    test("renders correctly", () => {
        render(<ModalNewInvoice {...defaultProps} />);
        expect(screen.getByText("Nova entrada")).toBeInTheDocument();
        expect(screen.getByLabelText("Tipo")).toBeInTheDocument();
        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Data")).toBeInTheDocument();
        expect(screen.getByLabelText("Parcelas")).toBeInTheDocument();
        expect(screen.getByLabelText("Dia de pagamento")).toBeInTheDocument();
        expect(screen.getByLabelText("Valor")).toBeInTheDocument();
        expect(screen.getByLabelText("Tags")).toBeInTheDocument();
        expect(screen.getByLabelText("Entrada mensal")).toBeInTheDocument();
    });

    test.skip("calls onFinish when form is submitted", () => {
        render(<ModalNewInvoice {...defaultProps} />);
        fireEvent.change(screen.getByPlaceholderText("Digite o nome"), { target: { value: "Test Name" } });
        fireEvent.change(screen.getByPlaceholderText(/selecione o tipo de entrada/i), { target: { value: 0 } });
        fireEvent.change(screen.getByPlaceholderText("Digite o valor"), { target: { value: 100 } });
        fireEvent.click(screen.getByRole("button", { name: /ok/i }));
        expect(defaultProps.onFinish).toHaveBeenCalled();
    });

    test("calls onCancel when cancel button is clicked", () => {
        render(<ModalNewInvoice {...defaultProps} />);
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test("renders tags correctly", () => {
        render(<ModalNewInvoice {...defaultProps} />);
        fireEvent.mouseDown(screen.getByLabelText("Tags"));
        expect(screen.getByText("Tag1")).toBeInTheDocument();
        expect(screen.getByText("Tag2")).toBeInTheDocument();
    });
});
