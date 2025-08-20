import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import useMenu from "@/components/menuInternal/useMenu";
import MenuInternal from "@/components/menuInternal/Index";

jest.mock("@/components/menuInternal/useMenu");

describe("Test Characters container", () => {
    test("renders correctly for unauthenticated users", () => {
        (useMenu as jest.Mock).mockReturnValue({
            status: "",
            collapsed: false,
            toggleCollapsed: jest.fn(),
            user: {
                is_superuser: false,
            },
        });

        render(<MenuInternal />);

        expect(screen.getByText("Inicio")).toBeInTheDocument();
        expect(screen.queryByText("Conta")).not.toBeInTheDocument();
        expect(screen.queryByText("Facetexture")).not.toBeInTheDocument();

        expect(screen.queryByText("Remoto")).not.toBeInTheDocument();
        expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
        expect(screen.queryByText("server")).not.toBeInTheDocument();

        expect(screen.queryByText("Comando")).not.toBeInTheDocument();
        expect(screen.queryByText("Remoto")).not.toBeInTheDocument();
        expect(screen.queryByText("Status")).not.toBeInTheDocument();
        expect(screen.queryByText("Overview")).not.toBeInTheDocument();
        expect(screen.queryByText("Contratos")).not.toBeInTheDocument();
        expect(screen.queryByText("Notas")).not.toBeInTheDocument();
        expect(screen.queryByText("Pagamentos")).not.toBeInTheDocument();
        expect(screen.queryByText("Tags")).not.toBeInTheDocument();
        expect(screen.queryByText("Servidor")).not.toBeInTheDocument();
    });

    test("renders correctly for authenticated normal users", () => {
        (useMenu as jest.Mock).mockReturnValue({
            status: "authenticated",
            collapsed: false,
            toggleCollapsed: jest.fn(),
            user: {
                is_superuser: false,
            },
        });

        render(<MenuInternal />);

        expect(screen.getByText("Inicio")).toBeInTheDocument();

        expect(screen.getByText("Conta")).toBeInTheDocument();
        expect(screen.getByText("Facetexture")).toBeInTheDocument();

        expect(screen.queryByText("Financeiro")).not.toBeInTheDocument();
        expect(screen.queryByText("Servidor")).not.toBeInTheDocument();

        expect(screen.queryByText("Comando")).not.toBeInTheDocument();
        expect(screen.queryByText("Remoto")).not.toBeInTheDocument();
        expect(screen.queryByText("Status")).not.toBeInTheDocument();
        expect(screen.queryByText("Overview")).not.toBeInTheDocument();
        expect(screen.queryByText("Contratos")).not.toBeInTheDocument();
        expect(screen.queryByText("Notas")).not.toBeInTheDocument();
        expect(screen.queryByText("Pagamentos")).not.toBeInTheDocument();
        expect(screen.queryByText("Tags")).not.toBeInTheDocument();
        expect(screen.queryByText("Servidor")).not.toBeInTheDocument();
    });

    test("renders correctly for authenticated super users", () => {
        (useMenu as jest.Mock).mockReturnValue({
            status: "authenticated",
            collapsed: false,
            toggleCollapsed: jest.fn(),
            user: {
                is_superuser: true,
            },
        });

        render(<MenuInternal />);

        expect(screen.getByText("Inicio")).toBeInTheDocument();

        expect(screen.getByText("Conta")).toBeInTheDocument();
        expect(screen.getByText("Facetexture")).toBeInTheDocument();

        expect(screen.getByText("Financeiro")).toBeInTheDocument();
        expect(screen.getByText("Servidor")).toBeInTheDocument();
    });
});
