import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ModalNewTag, { IFormModalNewTag } from "./index";

describe("ModalNewTag Component", () => {
    const defaultProps = {
        visible: true,
        onCancel: jest.fn(),
        onFinish: jest.fn(),
    };

    const setup = (props = defaultProps) => {
        return render(<ModalNewTag {...props} />);
    };

    test("renders ModalNewTag component", () => {
        setup();
        expect(screen.getByText("Nova tag")).toBeInTheDocument();
    });

    test("renders form fields", () => {
        setup();
        expect(screen.getByLabelText("Nome")).toBeInTheDocument();
        expect(screen.getByLabelText("Cor")).toBeInTheDocument();
    });

    test("calls onCancel when cancel button is clicked", () => {
        setup();
        fireEvent.click(screen.getByText("Cancel"));
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test("calls onFinish when form is submitted", async () => {
        const onFinish = jest.fn();
        setup({ ...defaultProps, onFinish });
        fireEvent.change(screen.getByTestId("tag-name"), { target: { value: "Test Tag" } });
        fireEvent.change(screen.getByTestId("tag-color"), { target: { value: "#ff0000" } });
        fireEvent.click(screen.getByRole("button", { name: /ok/i }));
        await waitFor(() => {
            expect(onFinish).toHaveBeenCalledWith({ name: "Test Tag", color: "#ff0000" });
        });
    });

    test("shows validation error when name is not provided", async () => {
        setup();
        fireEvent.click(screen.getByText("OK"));
        expect(await screen.findByText("Entre com o nome da tag")).toBeInTheDocument();
    });
});
