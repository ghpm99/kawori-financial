import React from "react";
import { render, screen } from "@testing-library/react";

const useQueryMock = jest.fn();
const useMutationMock = jest.fn();
const useQueryClientMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
    useQueryClient: () => useQueryClientMock(),
}));

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

const { AuthProvider, useAuth } = require("./index");

const AuthConsumer = () => {
    const auth = useAuth();
    return <pre data-testid="auth-context">{JSON.stringify({ isAuthenticated: auth.isAuthenticated, authState: auth.authState })}</pre>;
};

describe("AuthProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useQueryClientMock.mockReturnValue({ removeQueries: jest.fn() });
    });

    test("considera autenticado quando verify retorna 200 mesmo com msg sem acento", () => {
        useQueryMock.mockReturnValue({
            data: { status: 200, data: { msg: "Token valido" } },
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

        useMutationMock
            .mockReturnValueOnce({
                mutateAsync: jest.fn(),
                isPending: false,
                error: null,
            })
            .mockReturnValueOnce({
                mutate: jest.fn(),
            })
            .mockReturnValueOnce({
                mutateAsync: jest.fn(),
                error: null,
            });

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>,
        );

        expect(screen.getByTestId("auth-context")).toHaveTextContent('"isAuthenticated":true');
        expect(screen.getByTestId("auth-context")).toHaveTextContent('"authState":"authenticated"');
    });

    test("retorna não autenticado quando verify não traz sucesso", () => {
        useQueryMock.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: jest.fn(),
        });

        useMutationMock
            .mockReturnValueOnce({
                mutateAsync: jest.fn(),
                isPending: false,
                error: null,
            })
            .mockReturnValueOnce({
                mutate: jest.fn(),
            })
            .mockReturnValueOnce({
                mutateAsync: jest.fn(),
                error: null,
            });

        render(
            <AuthProvider>
                <AuthConsumer />
            </AuthProvider>,
        );

        expect(screen.getByTestId("auth-context")).toHaveTextContent('"isAuthenticated":false');
        expect(screen.getByTestId("auth-context")).toHaveTextContent('"authState":"unauthenticated"');
    });
});
