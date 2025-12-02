import { fireEvent, screen } from "@testing-library/react";
import LoginHeader, { IUser } from "./Index";
import renderWithProviders from "@/tests/util";

// mock para evitar navegação
jest.mock("next/link", () => {
    return ({ children }: any) => children;
});

// mock do UserDrawer para facilitar os testes
jest.mock("../user", () => {
    return ({ open, onClose, onSignout }: any) => (
        <div data-testid="user-drawer">
            <span>{open ? "open" : "closed"}</span>
            <button onClick={onClose}>close</button>
            <button onClick={onSignout}>signout</button>
        </div>
    );
});

const mockUser = {
    id: 1,
    name: "Guilherme",
    username: "gui",
    first_name: "Guilherme",
    last_name: "H",
    email: "test@test.com",
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: "",
    date_joined: "",
} satisfies IUser;

describe("LoginHeader", () => {
    test("renderiza botões de Logar e Cadastrar quando não autenticado", () => {
        renderWithProviders(<LoginHeader isAuthenticated={false} user={undefined} handleSignout={() => {}} />);

        expect(screen.getByText("Logar")).toBeInTheDocument();
        expect(screen.getByText("Cadastrar")).toBeInTheDocument();

        // não deve mostrar avatar
        expect(screen.queryByText("Guilherme")).not.toBeInTheDocument();
    });

    test("renderiza avatar e nome do usuário quando autenticado", () => {
        renderWithProviders(<LoginHeader isAuthenticated={true} user={mockUser} handleSignout={() => {}} />);

        expect(screen.getByText("Guilherme")).toBeInTheDocument();
        expect(screen.getByTestId("user-drawer")).toBeInTheDocument();
    });

    test("abre o drawer ao clicar no avatar", () => {
        renderWithProviders(<LoginHeader isAuthenticated={true} user={mockUser} handleSignout={() => {}} />);

        const avatarButton = screen.getByText("Guilherme");
        fireEvent.click(avatarButton);

        expect(screen.getByText("open")).toBeInTheDocument();
    });

    test("fecha o drawer ao clicar no botão 'close'", () => {
        renderWithProviders(<LoginHeader isAuthenticated={true} user={mockUser} handleSignout={() => {}} />);

        const avatarButton = screen.getByText("Guilherme");
        fireEvent.click(avatarButton); // abre

        const closeBtn = screen.getByText("close");
        fireEvent.click(closeBtn);

        expect(screen.getByText("closed")).toBeInTheDocument();
    });

    test("chama handleSignout quando clicar no botão de sair do drawer", () => {
        const onSignout = jest.fn();

        renderWithProviders(<LoginHeader isAuthenticated={true} user={mockUser} handleSignout={onSignout} />);

        // primeiro abre o drawer
        fireEvent.click(screen.getByText("Guilherme"));

        // depois clica em signout
        fireEvent.click(screen.getByText("signout"));

        expect(onSignout).toHaveBeenCalledTimes(1);
    });

    test("não renderiza UserDrawer quando não há usuário", () => {
        renderWithProviders(<LoginHeader isAuthenticated={true} user={undefined} handleSignout={() => {}} />);

        expect(screen.queryByTestId("user-drawer")).not.toBeInTheDocument();
    });
});
