import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import AuditPage from "./page";

const updateSearchParamsMock = jest.fn();
const useUserMock = jest.fn();
const useQueryMock = jest.fn();

jest.mock("recharts", () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    CartesianGrid: () => <div />,
    Tooltip: () => <div />,
    XAxis: () => <div />,
    YAxis: () => <div />,
    Legend: () => <div />,
    Line: () => <div />,
    Bar: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Pie: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    Cell: () => <div />,
}));

jest.mock("@/components/providers/user", () => ({
    useUser: () => useUserMock(),
}));

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => "/admin/audit",
    useSearchParams: () => new URLSearchParams("category=auth&limit=20"),
}));

jest.mock("@/util", () => {
    const actual = jest.requireActual("@/util");
    return {
        ...actual,
        updateSearchParams: (...args: unknown[]) => updateSearchParamsMock(...args),
    };
});

describe("AuditPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useUserMock.mockReturnValue({ groups: ["admin"], loading: false });
        useQueryMock.mockReturnValue({
            data: {
                filters: {},
                summary: {
                    total_events: 12,
                    unique_users: 4,
                    success_events: 8,
                    failure_events: 3,
                    error_events: 1,
                },
                interactions_by_day: [{ day: "2026-01-01", count: 2 }],
                by_action: [{ action: "login", count: 5 }],
                by_category: [{ category: "auth", count: 5 }],
                by_user: [{ user_id: "1", username: "admin", count: 5 }],
                failures_by_action: [{ action: "token.refresh", count: 1 }],
            },
            isLoading: false,
            isFetching: false,
            error: undefined,
        });
    });

    test("renderiza loading quando user ainda está carregando", () => {
        useUserMock.mockReturnValue({ groups: [], loading: true });
        const { container } = render(<AuditPage />);
        expect(container.querySelector(".ant-spin")).toBeInTheDocument();
    });

    test("bloqueia acesso quando usuário não é admin", () => {
        useUserMock.mockReturnValue({ groups: ["user"], loading: false });
        render(<AuditPage />);
        expect(screen.getByText("Acesso negado")).toBeInTheDocument();
    });

    test("renderiza painel completo com dados", () => {
        render(<AuditPage />);

        expect(screen.getByText("Auditoria do Sistema")).toBeInTheDocument();
        expect(screen.getByText("Eventos totais")).toBeInTheDocument();
        expect(screen.getByText("Top usuarios")).toBeInTheDocument();
        expect(screen.getByText("Interacoes por dia")).toBeInTheDocument();
    });

    test("renderiza alerta de erro quando query falha", () => {
        useQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            isFetching: false,
            error: { response: { data: { msg: "falhou" } } },
        });

        render(<AuditPage />);
        expect(screen.getByText("Falha ao carregar relatorio de auditoria")).toBeInTheDocument();
    });

    test("aciona limpeza de filtros", () => {
        render(<AuditPage />);

        fireEvent.click(screen.getByRole("button", { name: /Limpar filtros/i }));
        expect(updateSearchParamsMock).toHaveBeenCalled();
    });
});
