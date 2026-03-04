import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@tanstack/react-query", () => ({
    QueryClient: function QueryClient(options: unknown) {
        return { options };
    },
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="query-client-provider">{children}</div>
    ),
}));

jest.mock("@ant-design/nextjs-registry", () => ({
    AntdRegistry: ({ children }: { children: React.ReactNode }) => <div data-testid="antd-registry">{children}</div>,
}));

jest.mock("./layout", () => ({
    LayoutProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="layout-provider">{children}</div>,
}));

jest.mock("./user", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="user-provider">{children}</div>,
}));

jest.mock("./themeProvider", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
}));

jest.mock("./auth", () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

const AppProviders = require("./index").default;

describe("AppProviders", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renderiza os providers encadeados e children", () => {
        render(
            <AppProviders>
                <div>app-child</div>
            </AppProviders>,
        );

        expect(screen.getByTestId("query-client-provider")).toBeInTheDocument();
        expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
        expect(screen.getByTestId("antd-registry")).toBeInTheDocument();
        expect(screen.getByTestId("auth-provider")).toBeInTheDocument();
        expect(screen.getByTestId("user-provider")).toBeInTheDocument();
        expect(screen.getByTestId("layout-provider")).toBeInTheDocument();
        expect(screen.getByText("app-child")).toBeInTheDocument();
    });
});
