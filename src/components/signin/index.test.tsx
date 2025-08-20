import LoginPage from "@/components/signin";
import { renderWithProviders } from "@/util/test-utils";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import axios from "axios";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
    })),
}));

describe("LoginPage", () => {
    test("should render the login form", () => {
        renderWithProviders(<LoginPage />);

        expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
        expect(screen.getByLabelText("Senha")).toBeInTheDocument();
        expect(screen.getByText("Logar")).toBeInTheDocument();
    });

    test("should show an error message when login fails", async () => {
        (axios.post as jest.Mock).mockRejectedValue({
            response: { status: 400, data: { msg: "mensagem de erro" } },
        });
        renderWithProviders(<LoginPage />);
        const usernameInput = screen.getByLabelText("Usuario");
        const passwordInput = screen.getByLabelText("Senha");
        const loginButton = screen.getByText("Logar");

        fireEvent.change(usernameInput, { target: { value: "test" } });
        fireEvent.change(passwordInput, { target: { value: "test" } });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByText(/usuario ou senha incorretos/i)).toBeInTheDocument();
        });
    });
});
