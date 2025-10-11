import useMenuHeader from "@/components/menuHeader/useMenuHeader";

import LandingLayout from "@/app/(landing)/layout.tsx";
import Home from "@/app/(landing)/page.tsx";
import { renderWithProviders } from "@/util/test-utils";
import { cleanup, render, screen } from "@testing-library/react";

jest.mock("@/components/menuHeader/useMenuHeader");
jest.mock("@/components/landing/news");
jest.mock("@/prismicio");
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));
jest.mock("react", () => ({
    ...jest.requireActual("react"),
    cache: jest.fn(),
}));

beforeAll(() => {
    cleanup();
});

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe("Home Page", () => {
    test("should render the page", () => {
        const { container } = renderWithProviders(<Home />);
        expect(container).toBeDefined();
    });

    test("should render the title correctly", () => {
        (useMenuHeader as jest.Mock).mockReturnValue({
            status: "authenticated",
            data: {
                user: {
                    image: "test-image",
                    name: "test-name",
                    email: "test-email",
                },
            },
        });
        renderWithProviders(<Home />);
        const title = screen.getByRole("heading", {
            name: /kawori é uma plataforma de personalização de tela de seleção de personagens para black desert online\./i,
        });
        expect(title).toBeInTheDocument();
    });

    test("should render the signup text correctly", () => {
        const { getByText } = renderWithProviders(<Home />);
        const signupText = getByText("O cadastro é gratuito, simples e rapido.");
        expect(signupText).toBeInTheDocument();
    });

    test("should render the form title correctly", () => {
        renderWithProviders(<Home />);
        const formTitle = screen.getByTestId(/cadastro-form/i);
        expect(formTitle).toBeInTheDocument();
    });

    test("should render the SingupForm component", () => {
        const { getByLabelText } = renderWithProviders(<Home />);
        const nameInput = getByLabelText("Nome");
        const lastNameInput = getByLabelText("Sobrenome");
        const usernameInput = getByLabelText("Usuario");
        const emailInput = getByLabelText("E-mail");
        const passwordInput = getByLabelText("Senha");
        const passwordConfirmationInput = getByLabelText("Confirme senha");
        expect(nameInput).toBeInTheDocument();
        expect(lastNameInput).toBeInTheDocument();
        expect(usernameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(passwordConfirmationInput).toBeInTheDocument();
    });

    test("should render the footer text correctly", () => {
        render(
            <LandingLayout>
                <div>Teste</div>
            </LandingLayout>,
        );
        const footerText = screen.getByText(/Sinta-se a vontade para entrar para/i);
        expect(footerText).toBeInTheDocument();
    });

    test("should render the discord link correctly", () => {
        (useMenuHeader as jest.Mock).mockReturnValue({
            status: "authenticated",
            data: "user-test",
        });
        render(
            <LandingLayout>
                <div>Teste</div>
            </LandingLayout>,
        );
        const discordLink = screen.getByText("nossa comunidade");
        expect(discordLink).toBeInTheDocument();
        expect(discordLink).toHaveAttribute("href", "https://discord.gg/fykNkXyn2r");
    });
});
