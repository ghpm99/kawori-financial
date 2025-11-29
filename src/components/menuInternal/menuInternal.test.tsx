import { render, screen, fireEvent } from "@testing-library/react";

import { Theme } from "@/styles/theme";
import MenuInternal from "./Index";

jest.mock("next/link", () => {
    return ({ children, href }: any) => <a href={href}>{children}</a>;
});

describe("MenuInternal", () => {
    const mockItems = [
        {
            key: "dashboard",
            label: "Dashboard",
        },
        {
            key: "settings",
            label: "Configurações",
        },
    ];

    const defaultProps = {
        theme: "dark" as Theme,
        selectedMenu: "dashboard",
        collapsed: false,
        toggleCollapsed: jest.fn(),
        menuItems: mockItems,
    };

    it("renderiza logo e menu", () => {
        render(<MenuInternal {...defaultProps} />);

        expect(screen.getByText("Kawori")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Configurações")).toBeInTheDocument();
    });

    it("marca o item selecionado corretamente", () => {
        render(<MenuInternal {...defaultProps} selectedMenu="settings" />);

        const settings = screen.getByText("Configurações");

        // O Antd aplica aria-selected nos itens ativos
        expect(settings.closest("li")).toHaveClass("ant-menu-item-selected");
    });

    it("renderiza com tema passado via props", () => {
        const { container } = render(<MenuInternal {...defaultProps} theme="light" />);

        // Antd adiciona classes baseadas no tema no Sider:
        // ant-layout-sider-light
        expect(container.querySelector(".ant-layout-sider-light")).toBeInTheDocument();
    });
});
