import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

const useCsvImportProviderMock = jest.fn();

jest.mock("antd", () => ({
    Modal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Steps: ({ items }: { items: Array<{ title: string }> }) => <div>{items.map((i) => i.title).join(",")}</div>,
    Button: ({
        children,
        onClick,
        disabled,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
    }) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

jest.mock("./steps/SelectTypeStep", () => () => <div>step-type</div>);
jest.mock("./steps/UploadStep", () => () => <div>step-upload</div>);
jest.mock("./steps/MappingStep", () => () => <div>step-mapping</div>);
jest.mock("./steps/PreviewStep", () => () => <div>step-preview</div>);
jest.mock("./steps/ReconciliationStep", () => () => <div>step-reconciliation</div>);
jest.mock("./steps/ConfirmStep", () => () => <div>step-confirm</div>);

jest.mock("../providers/csvImport", () => ({
    FIRST_STEP: "type",
    useCsvImportProvider: () => useCsvImportProviderMock(),
}));

import CsvImportModal from "./CsvImportModal";

describe("CsvImportModal", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renderiza etapa de mapeamento e executa processar", () => {
        const processTransactions = jest.fn();
        const goToPreviousStep = jest.fn();

        useCsvImportProviderMock.mockReturnValue({
            step: "mapping",
            steps: [{ key: "type", title: "Tipo", icon: null }],
            currentStepIndex: 0,
            goToPreviousStep,
            handleCloseModal: jest.fn(),
            openModal: true,
            processTransactions,
            isProcessing: false,
            stats: { toImport: 0 },
            handleImport: jest.fn(),
            goToStep: jest.fn(),
        });

        render(<CsvImportModal />);

        expect(screen.getByText("Importar Transações via CSV")).toBeInTheDocument();
        expect(screen.getByText("step-mapping")).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Processar dados/i));
        fireEvent.click(screen.getByText(/Voltar/i));
        expect(processTransactions).toHaveBeenCalled();
        expect(goToPreviousStep).toHaveBeenCalled();
    });

    test("renderiza etapa de preview e reconciliation", () => {
        const goToStep = jest.fn();
        const handleImport = jest.fn();

        useCsvImportProviderMock.mockReturnValue({
            step: "preview",
            steps: [{ key: "preview", title: "Preview", icon: null }],
            currentStepIndex: 0,
            goToPreviousStep: jest.fn(),
            handleCloseModal: jest.fn(),
            openModal: true,
            processTransactions: jest.fn(),
            isProcessing: false,
            stats: { toImport: 2 },
            handleImport,
            goToStep,
        });

        const { rerender } = render(<CsvImportModal />);
        expect(screen.getByText("step-preview")).toBeInTheDocument();
        fireEvent.click(screen.getByText(/Reconciliar/i));
        expect(goToStep).toHaveBeenCalledWith("reconciliation");

        useCsvImportProviderMock.mockReturnValue({
            step: "reconciliation",
            steps: [{ key: "reconciliation", title: "Reconciliação", icon: null }],
            currentStepIndex: 0,
            goToPreviousStep: jest.fn(),
            handleCloseModal: jest.fn(),
            openModal: true,
            processTransactions: jest.fn(),
            isProcessing: false,
            stats: { toImport: 2 },
            handleImport,
            goToStep,
        });
        rerender(<CsvImportModal />);
        fireEvent.click(screen.getByText(/Importar 2 transações/i));
        expect(handleImport).toHaveBeenCalled();
    });

    test("renderiza etapa confirm sem footer", () => {
        useCsvImportProviderMock.mockReturnValue({
            step: "confirm",
            steps: [{ key: "confirm", title: "Confirmar", icon: null }],
            currentStepIndex: 0,
            goToPreviousStep: jest.fn(),
            handleCloseModal: jest.fn(),
            openModal: true,
            processTransactions: jest.fn(),
            isProcessing: false,
            stats: { toImport: 0 },
            handleImport: jest.fn(),
            goToStep: jest.fn(),
        });

        render(<CsvImportModal />);
        expect(screen.getByText("step-confirm")).toBeInTheDocument();
    });
});
