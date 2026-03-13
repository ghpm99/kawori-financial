import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import { LayoutProvider, useLayout } from "./index";

const usePathnameMock = jest.fn();
const useAuthMock = jest.fn();
const useUserMock = jest.fn();

jest.mock("next/navigation", () => ({
    usePathname: () => usePathnameMock(),
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

jest.mock("../auth", () => ({
    useAuth: () => useAuthMock(),
}));

jest.mock("../user", () => ({
    useUser: () => useUserMock(),
}));

const LayoutConsumer = () => {
    const { selectedMenu, menuCollapsed, toggleCollapsed, menuItems } = useLayout();

    return (
        <div>
            <div data-testid="selected-menu">{selectedMenu}</div>
            <div data-testid="menu-collapsed">{String(menuCollapsed)}</div>
            <div data-testid="menu-keys">
                {menuItems.map((item) => String((item as { key: string })?.key)).join(",")}
            </div>
            <button onClick={toggleCollapsed}>toggle</button>
        </div>
    );
};

describe("LayoutProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("filtra menu por autenticação/grupo e alterna colapso", () => {
        usePathnameMock.mockReturnValue("/internal/financial/monthly");
        useAuthMock.mockReturnValue({ isAuthenticated: true });
        useUserMock.mockReturnValue({ groups: ["financial"] });

        render(
            <LayoutProvider>
                <LayoutConsumer />
            </LayoutProvider>,
        );

        expect(screen.getByTestId("selected-menu")).toHaveTextContent("bank_statement");
        expect(screen.getByTestId("menu-keys")).toHaveTextContent("bank_statement");
        expect(screen.getByTestId("menu-keys")).not.toHaveTextContent("audit");
        expect(document.title).toContain("Kawori Extrato Bancário");

        fireEvent.click(screen.getByText("toggle"));
        expect(screen.getByTestId("menu-collapsed")).toHaveTextContent("true");
    });

    test("mostra apenas rota pública quando não autenticado e sem grupo", () => {
        usePathnameMock.mockReturnValue("/rota-inexistente");
        useAuthMock.mockReturnValue({ isAuthenticated: false });
        useUserMock.mockReturnValue({ groups: [] });

        render(
            <LayoutProvider>
                <LayoutConsumer />
            </LayoutProvider>,
        );

        expect(screen.getByTestId("selected-menu")).toHaveTextContent("home");
        expect(screen.getByTestId("menu-keys")).toHaveTextContent("home");
        expect(screen.getByTestId("menu-keys")).not.toHaveTextContent("dashboard");
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useLayout())).toThrow("useLayout must be used within LayoutProvider");
    });
});
