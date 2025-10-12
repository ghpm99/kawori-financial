import { renderWithProviders } from "@/util/test-utils";
import { screen } from "@testing-library/react";
import FinancialPage from "./page";

describe("FinancialPage", () => {
    test("should render FinancialPage correctly", () => {
        renderWithProviders(<FinancialPage />);

        expect(screen.getByText("Kawori")).toBeInTheDocument();
        expect(screen.getByText("Financeiro")).toBeInTheDocument();
        expect(screen.getAllByText("Em aberto")[0]).toBeInTheDocument();
        expect(screen.getByText("Valores em aberto")).toBeInTheDocument();
    });

    test("should render table with correct columns", () => {
        renderWithProviders(<FinancialPage />);

        expect(screen.getByText("Id")).toBeInTheDocument();
        expect(screen.getByText("Nome")).toBeInTheDocument();
        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("Baixado")).toBeInTheDocument();
        expect(screen.getAllByText("Em aberto")[0]).toBeInTheDocument();
        expect(screen.getByText("Ações")).toBeInTheDocument();
    });
});
