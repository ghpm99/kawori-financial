import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import RootLayout from "./layout";
import LandingLayout from "./(landing)/layout";
import Home from "./(landing)/page";
import SigninPage from "./(landing)/signin/page";
import SignupPage from "./(landing)/signup/page";
import ResetPasswordPage from "./(landing)/reset-password/page";
import GlobalError from "./global-error";
import sitemap from "./sitemap";

const pushMock = jest.fn();
const useAuthMock = jest.fn();
const useMutationMock = jest.fn();

jest.mock("@/components/providers", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div data-testid="providers">{children}</div>,
}));

jest.mock("@/components/menuHeader", () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => <div data-testid="menu-header">{JSON.stringify(props)}</div>,
}));

jest.mock("@/components/providers/auth", () => ({
    useAuth: () => useAuthMock(),
}));

jest.mock("@tanstack/react-query", () => {
    const actual = jest.requireActual("@tanstack/react-query");
    return {
        ...actual,
        useMutation: (...args: unknown[]) => useMutationMock(...args),
    };
});

jest.mock("@/components/resetPassword/emailStep", () => ({
    __esModule: true,
    default: ({ onSuccess }: { onSuccess: (value: string) => void }) => (
        <button onClick={() => onSuccess("a@b.com")}>email-step</button>
    ),
}));

jest.mock("@/components/resetPassword/tokenStep", () => ({
    __esModule: true,
    default: ({ onSuccess }: { onSuccess: (value: string) => void }) => (
        <button onClick={() => onSuccess("token-1")}>token-step</button>
    ),
}));

jest.mock("@/components/resetPassword/newPasswordStep", () => ({
    __esModule: true,
    default: ({ onSuccess }: { onSuccess: (value: string) => void }) => (
        <button onClick={() => onSuccess("new-password")}>password-step</button>
    ),
}));

jest.mock("@/components/resetPassword/successStep", () => ({
    __esModule: true,
    default: () => <div>success-step</div>,
}));

jest.mock("@vercel/analytics/react", () => ({
    Analytics: () => <div data-testid="analytics" />,
}));

jest.mock("@vercel/speed-insights/next", () => ({
    SpeedInsights: () => <div data-testid="speed-insights" />,
}));

jest.mock("next/error", () => ({
    __esModule: true,
    default: ({ statusCode }: { statusCode: number }) => <div data-testid="next-error">{statusCode}</div>,
}));

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

jest.mock("antd-style", () => ({
    createStyles: () => () => ({
        styles: { linearGradientButton: "gradient-button" },
    }),
}));

describe("app core", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthMock.mockReturnValue({
            authState: "unauthenticated",
            isLoading: false,
            signOut: jest.fn(),
            signIn: jest.fn(),
            signUp: jest.fn(),
            isAuthenticated: false,
            signInMessage: undefined,
            signUpMessage: undefined,
        });
        useMutationMock.mockImplementation((options: { onSuccess?: (...args: unknown[]) => void }) => ({
            mutate: (value: unknown) => options.onSuccess?.({ data: { valid: true } }, value),
            isPending: false,
        }));
    });

    test("renderiza RootLayout com providers e scripts de analytics", () => {
        const view = RootLayout({
            children: <div>content</div>,
        }) as React.ReactElement;

        expect(view.type).toBe("html");
        expect(view.props.lang).toBe("pt-br");
    });

    test("renderiza LandingLayout com header e footer", () => {
        render(
            <LandingLayout>
                <div>landing-child</div>
            </LandingLayout>,
        );

        expect(screen.getByTestId("menu-header")).toBeInTheDocument();
        expect(screen.getByText("landing-child")).toBeInTheDocument();
        expect(screen.getByText(/Kawori Financial/i)).toBeInTheDocument();
    });

    test("renderiza landing page com CTA", () => {
        render(<Home />);

        expect(screen.getByText(/Organize seus gastos, orçamento e metas/i)).toBeInTheDocument();
        expect(screen.getAllByRole("link", { name: /Criar conta/i }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("link", { name: /Entrar/i }).length).toBeGreaterThan(0);
    });

    test("signin redireciona quando autenticado", () => {
        useAuthMock.mockReturnValue({
            signIn: jest.fn(),
            isAuthenticated: true,
            isLoading: false,
            signInMessage: undefined,
        });

        render(<SigninPage />);
        expect(pushMock).toHaveBeenCalledWith("/internal/financial");
    });

    test("signin renderiza mensagem de erro quando existir", () => {
        useAuthMock.mockReturnValue({
            signIn: jest.fn(),
            isAuthenticated: false,
            isLoading: false,
            signInMessage: "Credenciais inválidas",
        });

        render(<SigninPage />);
        expect(screen.getByText("Credenciais inválidas")).toBeInTheDocument();
    });

    test("signup redireciona quando autenticado", () => {
        useAuthMock.mockReturnValue({
            signUp: jest.fn(),
            isAuthenticated: true,
            signUpMessage: undefined,
        });

        render(<SignupPage />);
        expect(pushMock).toHaveBeenCalledWith("/internal/financial");
    });

    test("signup renderiza mensagem de erro quando existir", () => {
        useAuthMock.mockReturnValue({
            signUp: jest.fn(),
            isAuthenticated: false,
            signUpMessage: "Usuário já existe",
        });

        render(<SignupPage />);
        expect(screen.getByText("Usuário já existe")).toBeInTheDocument();
    });

    test("reset-password avança de etapa até sucesso", () => {
        render(<ResetPasswordPage />);

        fireEvent.click(screen.getByText("email-step"));
        fireEvent.click(screen.getByText("token-step"));
        fireEvent.click(screen.getByText("password-step"));

        expect(screen.getByText("success-step")).toBeInTheDocument();
    });

    test("global error reporta no sentry e renderiza NextError", () => {
        const error = new Error("falha");
        render(<GlobalError error={error} />);

        expect(screen.getByTestId("next-error")).toHaveTextContent("0");
    });

    test("sitemap inclui rotas principais", () => {
        const items = sitemap();

        expect(items).toHaveLength(3);
        expect(items[0].url).toContain("financeiro.kawori.site/");
        expect(items[1].url).toContain("/signup");
        expect(items[2].url).toContain("/signin");
    });
});
