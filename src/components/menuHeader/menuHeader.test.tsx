import { screen, fireEvent, render } from "@testing-library/react";
import MenuHeader from ".";

// @ts-ignore
jest.mock("next/link", () => {
    return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe("MenuHeader", () => {
    it("renderiza itens padrão sempre visíveis", () => {
        render(<MenuHeader authState="unauthenticated" isLoading={false} signOut={jest.fn()} />);

        expect(screen.getByText("Kawori")).toBeInTheDocument();
        expect(screen.getByText("Inicio")).toBeInTheDocument();
    });

    it("renderiza links de Logar e Cadastrar quando não autenticado", () => {
        render(<MenuHeader authState="unauthenticated" isLoading={false} signOut={jest.fn()} />);

        expect(screen.getByText("Logar")).toBeInTheDocument();
        expect(screen.getByText("Cadastrar")).toBeInTheDocument();
        expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
        expect(screen.queryByText("Sair")).not.toBeInTheDocument();
    });

    it("renderiza Dashboard e Sair quando autenticado", () => {
        render(<MenuHeader authState="authenticated" isLoading={false} signOut={jest.fn()} />);

        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Sair")).toBeInTheDocument();
        expect(screen.queryByText("Logar")).not.toBeInTheDocument();
        expect(screen.queryByText("Cadastrar")).not.toBeInTheDocument();
    });

    it("aciona signOut ao clicar em Sair", () => {
        const mockSignOut = jest.fn();
        render(<MenuHeader authState="authenticated" isLoading={false} signOut={mockSignOut} />);

        const sairButton = screen.getByText("Sair");
        fireEvent.click(sairButton);

        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    it("não renderiza menu quando authState é unknown", () => {
        render(<MenuHeader authState="unknown" isLoading={false} signOut={jest.fn()} />);

        expect(screen.queryByText("Logar")).not.toBeInTheDocument();
        expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    });

    it("não renderiza menu quando isLoading é true", () => {
        render(<MenuHeader authState="authenticated" isLoading={true} signOut={jest.fn()} />);

        expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
        expect(screen.queryByText("Sair")).not.toBeInTheDocument();
    });
});
