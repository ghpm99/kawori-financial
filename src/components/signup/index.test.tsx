import SingupForm from "@/components/signup/index";

import { renderWithProviders } from "@/util/test-utils";

import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import axios from "axios";
import { useRouter } from "next/navigation";

jest.mock("next/navigation");

describe("SignupForm", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should render SignupForm correctly", () => {
        renderWithProviders(<SingupForm />);
        expect(screen.getByTestId("form-name")).toBeInTheDocument();
        expect(screen.getByTestId("form-last-name")).toBeInTheDocument();
        expect(screen.getByTestId("form-username")).toBeInTheDocument();
        expect(screen.getByTestId("form-email")).toBeInTheDocument();
        expect(screen.getByTestId("form-password")).toBeInTheDocument();
        expect(screen.getByTestId("form-confirm")).toBeInTheDocument();
        expect(screen.getByText("Cadastrar")).toBeInTheDocument();
    });
    describe("form validation", () => {
        test.skip("should show an error message when form submission is invalid", async () => {
            renderWithProviders(<SingupForm />);
            const signupButton = screen.getByText("Cadastrar");
            userEvent.click(signupButton);

            expect(await screen.findByText("Por favor insira seu nome!")).toBeInTheDocument();
            expect(await screen.findByText("Por favor insira seu sobrenome!")).toBeInTheDocument();
            expect(await screen.findByText("Por favor insira seu usuário!")).toBeInTheDocument();
            expect(await screen.findByText("Por favor insira seu e-mail!")).toBeInTheDocument();
            expect(await screen.findByText("Por favor insira sua senha!")).toBeInTheDocument();
            expect(await screen.findByText("Por favor confirme sua senha!")).toBeInTheDocument();
        });
        test("should show an error message when name is more than 100 characters", async () => {
            renderWithProviders(<SingupForm />);
            const usernameInput = screen.getByTestId("form-name");
            await userEvent.type(usernameInput, "a".repeat(101));
            await waitFor(() => {
                expect(screen.getByText(/o nome deve ter no máximo 100 caracteres!/i)).toBeInTheDocument();
            });
        });
        test("should show an error message when last_name is more than 100 characters", async () => {
            renderWithProviders(<SingupForm />);
            const usernameInput = screen.getByTestId("form-last-name");
            await userEvent.type(usernameInput, "a".repeat(101));
            await waitFor(() => {
                expect(screen.getByText(/o sobrenome deve ter no máximo 100 caracteres!/i)).toBeInTheDocument();
            });
        });
        test("should show an error message when username is more than 100 characters", async () => {
            renderWithProviders(<SingupForm />);
            const usernameInput = screen.getByTestId("form-username");
            await userEvent.type(usernameInput, "a".repeat(101));
            await waitFor(() => {
                expect(screen.getByText(/o usuário deve ter no máximo 100 caracteres!/i)).toBeInTheDocument();
            });
        });
        test("should show an error message when email is invalid", async () => {
            renderWithProviders(<SingupForm />);
            const emailInput = screen.getByLabelText("E-mail");
            fireEvent.change(emailInput, { target: { value: "invalid-email" } });

            const signupButton = screen.getByText("Cadastrar");
            userEvent.click(signupButton);

            await waitFor(() => {
                expect(screen.getByText("Por favor verifique seu e-mail")).toBeInTheDocument();
            });
        });
        test("should show an error message when password is less than 8 characters", async () => {
            renderWithProviders(<SingupForm />);
            const passwordInput = screen.getByTestId("form-password");
            await userEvent.type(passwordInput, "test");
            await waitFor(() => {
                expect(screen.getByText(/a senha deve ter no mínimo 8 caracteres!/i)).toBeInTheDocument();
            });
        });
        test("should show an error message when password and password confirmation do not match", async () => {
            renderWithProviders(<SingupForm />);
            const passwordInput = screen.getByTestId("form-password");
            const passwordConfirmationInput = screen.getByTestId("form-confirm");
            userEvent.type(passwordInput, "test@123");
            userEvent.type(passwordConfirmationInput, "test@1234");

            await waitFor(() => {
                expect(screen.getByText("As duas senhas que você digitou não correspondem!")).toBeInTheDocument();
            });
        });
    });
    test.skip("should call signupService and signIn when form submission is successful", async () => {
        const push = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push });

        renderWithProviders(<SingupForm />);

        const nameInput = screen.getByLabelText("Nome");
        const lastNameInput = screen.getByLabelText("Sobrenome");
        const usernameInput = screen.getByLabelText("Usuario");
        const emailInput = screen.getByLabelText("E-mail");
        const passwordInput = screen.getByLabelText("Senha");
        const passwordConfirmationInput = screen.getByLabelText("Confirme senha");
        const signupButton = screen.getByText("Cadastrar");

        fireEvent.change(nameInput, { target: { value: "test" } });
        fireEvent.change(lastNameInput, { target: { value: "test" } });
        fireEvent.change(usernameInput, { target: { value: "test" } });
        fireEvent.change(emailInput, { target: { value: "test@teste.com" } });
        fireEvent.change(passwordInput, { target: { value: "test@123" } });
        fireEvent.change(passwordConfirmationInput, { target: { value: "test@123" } });
        userEvent.click(signupButton);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/signup", {
                name: "test",
                last_name: "test",
                username: "test",
                email: "test@teste.com",
                password: "test@123",
                confirm: "test@123",
            });
        });
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/token/", {
                username: "test",
                password: "test@123",
                remember: true,
            });
        });

        await waitFor(() => {
            expect(push).toHaveBeenCalledWith("/internal/user");
        });
    });

    test("should show an error message when signupService fails", async () => {
        (axios.post as jest.Mock).mockRejectedValue({
            response: { status: 400, data: { msg: "mensagem de erro" } },
        });

        renderWithProviders(<SingupForm />);

        const nameInput = screen.getByLabelText("Nome");
        const lastNameInput = screen.getByLabelText("Sobrenome");
        const usernameInput = screen.getByLabelText("Usuario");
        const emailInput = screen.getByLabelText("E-mail");
        const passwordInput = screen.getByLabelText("Senha");
        const passwordConfirmationInput = screen.getByLabelText("Confirme senha");
        const signupButton = screen.getByText("Cadastrar");

        fireEvent.change(nameInput, { target: { value: "test" } });
        fireEvent.change(lastNameInput, { target: { value: "test" } });
        fireEvent.change(usernameInput, { target: { value: "test" } });
        fireEvent.change(emailInput, { target: { value: "test@teste.com" } });
        fireEvent.change(passwordInput, { target: { value: "test@123" } });
        fireEvent.change(passwordConfirmationInput, { target: { value: "test@123" } });
        userEvent.click(signupButton);

        await waitFor(() => {
            const errorMessage = screen.getByText("mensagem de erro");
            expect(errorMessage).toBeInTheDocument();
        });
    });
});
