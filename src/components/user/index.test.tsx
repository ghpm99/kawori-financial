import { render, screen, fireEvent } from "@testing-library/react";
import dayjs from "dayjs";
import UserDrawer, { IUserDrawerProps } from ".";
import { IUserData } from "../providers/user";

const requestPasswordResetServiceMock = jest.fn();
const socialAccountsServiceMock = jest.fn();
const unlinkSocialAccountServiceMock = jest.fn();

jest.mock("@/services/auth", () => ({
    requestPasswordResetService: (...args: unknown[]) => requestPasswordResetServiceMock(...args),
    socialAccountsService: (...args: unknown[]) => socialAccountsServiceMock(...args),
    unlinkSocialAccountService: (...args: unknown[]) => unlinkSocialAccountServiceMock(...args),
}));

jest.mock("../socialAuthButtons", () => ({
    __esModule: true,
    default: () => <div data-testid="social-auth-buttons" />,
}));

jest.mock("antd", () => {
    const antd = jest.requireActual("antd");
    return {
        ...antd,
        DatePicker: (props: any) => (
            <input
                data-testid={props["data-testid"] ?? "datepicker"}
                value={props.value ? props.value.format("DD/MM/YYYY hh:mm:ss") : ""}
                readOnly
            />
        ),
    };
});

const mockUser: IUserData = {
    name: "Guilherme",
    username: "gui123",
    first_name: "Guilherme",
    last_name: "H",
    email: "guilherme@example.com",
    date_joined: "2024-01-10T12:00:00Z",
    last_login: "2024-02-15T18:30:00Z",
    id: 1,
    is_staff: true,
    is_active: true,
    is_superuser: true,
};

const defaultProps: IUserDrawerProps = {
    user: mockUser,
    open: true,
    onClose: jest.fn(),
    onSignout: jest.fn(),
};

describe("UserDrawer Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        requestPasswordResetServiceMock.mockResolvedValue({
            data: { msg: "Se o e-mail estiver cadastrado, voce recebera as instrucoes em breve." },
        });
        socialAccountsServiceMock.mockImplementation(() => new Promise(() => {}));
        unlinkSocialAccountServiceMock.mockResolvedValue({
            data: { msg: "Conta social desvinculada." },
        });
    });

    test("renderiza o drawer com título correto", () => {
        render(<UserDrawer {...defaultProps} />);
        expect(screen.getByText("Detalhes da conta")).toBeInTheDocument();
    });

    test("exibe os dados iniciais do usuário corretamente", () => {
        render(<UserDrawer {...defaultProps} />);

        expect(screen.getByLabelText("Nome")).toHaveValue("Guilherme");
        expect(screen.getByLabelText("Usuario")).toHaveValue("gui123");
        expect(screen.getByLabelText("Primeiro nome")).toHaveValue("Guilherme");
        expect(screen.getByLabelText("Ultimo nome")).toHaveValue("H");
        expect(screen.getByLabelText("E-mail")).toHaveValue("guilherme@example.com");

        expect(screen.getByDisplayValue(dayjs(mockUser.date_joined).format("DD/MM/YYYY hh:mm:ss"))).toBeInTheDocument();

        expect(screen.getByDisplayValue(dayjs(mockUser.last_login).format("DD/MM/YYYY hh:mm:ss"))).toBeInTheDocument();
    });

    test("mostra o botão Deslogar quando onSignout é fornecido", () => {
        render(<UserDrawer {...defaultProps} />);
        expect(screen.getByText("Deslogar")).toBeInTheDocument();
    });

    test("não mostra botão Deslogar quando onSignout não é fornecido", () => {
        render(<UserDrawer {...defaultProps} onSignout={undefined} />);
        expect(screen.queryByText("Deslogar")).not.toBeInTheDocument();
    });

    test("clique em Deslogar muda para Confirmar", () => {
        render(<UserDrawer {...defaultProps} />);

        const logoutBtn = screen.getByText("Deslogar");
        fireEvent.click(logoutBtn);

        expect(screen.getByText("Confirmar")).toBeInTheDocument();
    });

    test("clique em Confirmar aciona onSignout", () => {
        render(<UserDrawer {...defaultProps} />);

        const logoutBtn = screen.getByText("Deslogar");
        fireEvent.click(logoutBtn); // vira "Confirmar"

        const confirmBtn = screen.getByText("Confirmar");
        fireEvent.click(confirmBtn);

        expect(defaultProps.onSignout).toHaveBeenCalledTimes(1);
    });

    test("fechar drawer chama onClose", () => {
        render(<UserDrawer {...defaultProps} />);

        const closeBtn = screen.getByRole("button", { name: /Salvar/i });
        fireEvent.click(closeBtn);

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    test("renderiza secao para alteracao de senha", () => {
        render(<UserDrawer {...defaultProps} />);

        expect(screen.getByText("Alterar senha")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Enviar link para alterar senha" })).toBeInTheDocument();
    });

    test("carrega contas sociais ao abrir drawer", () => {
        render(<UserDrawer {...defaultProps} />);

        expect(socialAccountsServiceMock).toHaveBeenCalledTimes(1);
    });
});
