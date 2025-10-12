import { renderWithProviders } from "@/util/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import ContractDetails from "./page";

jest.mock("@/lib/features/auth", () => ({
    setSelectedMenu: jest.fn(),
}));

describe.skip("ContractDetails", () => {
    test("renders contract details correctly", () => {
        renderWithProviders(<ContractDetails params={{ id: 1 }} />);

        expect(screen.getByText("ID: 1")).toBeInTheDocument();
        expect(screen.getByText("Nome:")).toBeInTheDocument();
        expect(screen.getByText("Test Contract")).toBeInTheDocument();
        expect(screen.getByText("Valor Total: $1,000.00")).toBeInTheDocument();
        expect(screen.getByText("Valor Baixado: $500.00")).toBeInTheDocument();
        expect(screen.getByText("Valor em Aberto: $500.00")).toBeInTheDocument();
    });

    test("opens new invoice modal on menu click", () => {
        renderWithProviders(<ContractDetails params={{ id: 1 }} />);

        fireEvent.click(screen.getByText("Salvar"));
        fireEvent.click(screen.getByText("Incluir nova nota"));

        const actions = store.getActions();
        expect(actions).toContainEqual({
            type: "financial/contract/changeVisibleModalContract",
            payload: { modal: "newInvoice", visible: true },
        });
    });
});
