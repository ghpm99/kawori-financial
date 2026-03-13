import { render, screen, fireEvent, act } from "@testing-library/react";
import dayjs from "dayjs";
import UserDrawer, { IUserDrawerProps } from ".";
import { IUserData } from "../providers/user";

const requestPasswordResetServiceMock = jest.fn();
const socialAccountsServiceMock = jest.fn();
const unlinkSocialAccountServiceMock = jest.fn();
const getEmailPreferencesServiceMock = jest.fn();
const updateEmailPreferencesServiceMock = jest.fn();

jest.mock("@/services/auth", () => ({
    requestPasswordResetService: (...args: unknown[]) => requestPasswordResetServiceMock(...args),
    socialAccountsService: (...args: unknown[]) => socialAccountsServiceMock(...args),
    unlinkSocialAccountService: (...args: unknown[]) => unlinkSocialAccountServiceMock(...args),
}));

jest.mock("@/services/user", () => ({
    getEmailPreferencesService: (...args: unknown[]) => getEmailPreferencesServiceMock(...args),
    updateEmailPreferencesService: (...args: unknown[]) => updateEmailPreferencesServiceMock(...args),
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
        Switch: ({ checked, disabled, onChange, "data-testid": testId }: any) => (
            <button
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => onChange?.(!checked)}
                data-testid={testId}
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
        getEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: true, allow_notification: true, allow_promotional: true },
        });
        updateEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: false, allow_notification: false, allow_promotional: false },
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

    test("carrega preferencias de e-mail ao abrir drawer", () => {
        render(<UserDrawer {...defaultProps} />);

        expect(getEmailPreferencesServiceMock).toHaveBeenCalledTimes(1);
    });

    test("renderiza secao de preferencias de e-mail", async () => {
        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        expect(screen.getByText("Preferencias de e-mail")).toBeInTheDocument();
        expect(screen.getByText("Permitir todos os e-mails")).toBeInTheDocument();
        expect(screen.getByText("Notificacoes")).toBeInTheDocument();
        expect(screen.getByText("Promocionais")).toBeInTheDocument();
    });

    test("switches de notificacao e promocional ficam disabled quando allow_all_emails esta ativo", async () => {
        getEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: true, allow_notification: true, allow_promotional: true },
        });

        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        expect(screen.getByTestId("switch-allow-all")).not.toBeDisabled();
        expect(screen.getByTestId("switch-notification")).toBeDisabled();
        expect(screen.getByTestId("switch-promotional")).toBeDisabled();
    });

    test("switches de notificacao e promocional ficam enabled quando allow_all_emails esta desativado", async () => {
        getEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: false, allow_notification: false, allow_promotional: false },
        });

        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        expect(screen.getByTestId("switch-notification")).not.toBeDisabled();
        expect(screen.getByTestId("switch-promotional")).not.toBeDisabled();
    });

    test("ao desativar allow_all_emails, envia PUT com todos os campos false", async () => {
        updateEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: false, allow_notification: false, allow_promotional: false },
        });

        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId("switch-allow-all"));
        });

        expect(updateEmailPreferencesServiceMock).toHaveBeenCalledWith({
            allow_all_emails: false,
            allow_notification: false,
            allow_promotional: false,
        });
    });

    test("ao ativar ambos notificacao e promocional, ativa allow_all_emails automaticamente", async () => {
        getEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: false, allow_notification: true, allow_promotional: false },
        });
        updateEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: true, allow_notification: true, allow_promotional: true },
        });

        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId("switch-promotional"));
        });

        expect(updateEmailPreferencesServiceMock).toHaveBeenCalledWith({
            allow_notification: true,
            allow_promotional: true,
            allow_all_emails: true,
        });
    });

    test("exibe mensagem de erro ao falhar carregamento de preferencias", async () => {
        getEmailPreferencesServiceMock.mockRejectedValue(new Error("Network error"));

        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        expect(screen.getByText("Nao foi possivel carregar preferencias de e-mail.")).toBeInTheDocument();
    });

    test("exibe mensagem de erro ao falhar atualizacao de preferencias", async () => {
        getEmailPreferencesServiceMock.mockResolvedValue({
            data: { allow_all_emails: true, allow_notification: true, allow_promotional: true },
        });
        updateEmailPreferencesServiceMock.mockRejectedValue(new Error("Network error"));

        await act(async () => {
            render(<UserDrawer {...defaultProps} />);
        });

        await act(async () => {
            fireEvent.click(screen.getByTestId("switch-allow-all"));
        });

        expect(screen.getByText("Nao foi possivel atualizar preferencias de e-mail.")).toBeInTheDocument();
    });
});
