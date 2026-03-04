import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

const useAuthMock = jest.fn();
const useQueryMock = jest.fn();

jest.mock("../auth", () => ({
    useAuth: () => useAuthMock(),
}));

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

jest.mock("@/services/user", () => ({
    userDetailService: jest.fn(async () => ({ data: {} })),
    userGroupsService: jest.fn(async () => ({ data: { data: [] } })),
}));

import UserProvider, { useUser } from "./index";

const UserConsumer = () => {
    const value = useUser();
    return <pre data-testid="user-context">{JSON.stringify(value)}</pre>;
};

describe("UserProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("preenche contexto e dispara refetch quando autenticado", async () => {
        const refetchUser = jest.fn();
        const refetchGroups = jest.fn();

        useAuthMock.mockReturnValue({ isAuthenticated: true });
        useQueryMock
            .mockReturnValueOnce({
                data: {
                    data: {
                        id: 10,
                        name: "Kawori",
                        username: "kawori",
                        first_name: "Ka",
                        last_name: "Wori",
                        email: "kawori@site.com",
                        is_staff: false,
                        is_active: true,
                        is_superuser: false,
                        last_login: "",
                        date_joined: "",
                    },
                },
                refetch: refetchUser,
                isLoading: false,
                error: null,
            })
            .mockReturnValueOnce({
                data: {
                    data: {
                        data: ["financial", "admin"],
                    },
                },
                refetch: refetchGroups,
            });

        render(
            <UserProvider>
                <UserConsumer />
            </UserProvider>,
        );

        await waitFor(() => {
            expect(refetchUser).toHaveBeenCalled();
            expect(refetchGroups).toHaveBeenCalled();
        });

        expect(screen.getByTestId("user-context")).toHaveTextContent('"name":"Kawori"');
        expect(screen.getByTestId("user-context")).toHaveTextContent('"groups":["financial","admin"]');
    });

    test("retorna fallback quando sem dados e não autenticado", () => {
        useAuthMock.mockReturnValue({ isAuthenticated: false });
        useQueryMock
            .mockReturnValueOnce({
                data: undefined,
                refetch: jest.fn(),
                isLoading: true,
                error: new Error("erro-user"),
            })
            .mockReturnValueOnce({
                data: undefined,
                refetch: jest.fn(),
            });

        render(
            <UserProvider>
                <UserConsumer />
            </UserProvider>,
        );

        expect(screen.getByTestId("user-context")).toHaveTextContent('"loading":true');
        expect(screen.getByTestId("user-context")).toHaveTextContent('"groups":[]');
        expect(screen.getByTestId("user-context")).toHaveTextContent('"error":{}');
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useUser())).toThrow("useUser must be used within UserProvider");
    });
});
