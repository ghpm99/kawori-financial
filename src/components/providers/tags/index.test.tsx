import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import { TagsProvider, useTags } from "./index";

const useQueryMock = jest.fn();
const useMutationMock = jest.fn();
const messageSuccessMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
    useQuery: (...args: unknown[]) => useQueryMock(...args),
    useMutation: (...args: unknown[]) => useMutationMock(...args),
}));

jest.mock("antd", () => ({
    message: {
        success: (...args: unknown[]) => messageSuccessMock(...args),
    },
}));

const TagsConsumer = () => {
    const {
        data,
        loading,
        openDrawer,
        tagDetails,
        handleOnOpenDrawer,
        handleOnCloseDrawer,
        onUpdateTagDetail,
        onCreateNewTag,
    } = useTags();

    return (
        <div>
            <div data-testid="loading">{String(loading)}</div>
            <div data-testid="open-drawer">{String(openDrawer)}</div>
            <div data-testid="tags-size">{String(data.length)}</div>
            <div data-testid="tag-detail">{JSON.stringify(tagDetails)}</div>
            <button onClick={() => handleOnOpenDrawer(7)}>open</button>
            <button onClick={handleOnCloseDrawer}>close</button>
            <button
                onClick={() =>
                    onUpdateTagDetail({
                        id: 7,
                        name: "Mercado",
                        color: "#000000",
                        total_payments: 0,
                        total_value: 0,
                        total_open: 0,
                        total_closed: 0,
                        is_budget: false,
                    })
                }
            >
                update
            </button>
            <button onClick={() => onCreateNewTag({ name: "Nova", color: "#ffffff" })}>create</button>
        </div>
    );
};

describe("TagsProvider", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("carrega dados, abre/fecha drawer e executa mutations com refetch", () => {
        const refetchMock = jest.fn();
        const mutateSaveMock = jest.fn();
        const mutateCreateMock = jest.fn();
        let mutationCallIndex = 0;

        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            if (options?.queryKey?.[0] === "tags") {
                return {
                    data: [{ id: 1, name: "Casa", color: "#fff" }],
                    isLoading: false,
                    refetch: refetchMock,
                };
            }

            return {
                data: { id: 7, name: "Mercado", color: "#111" },
                isLoading: false,
            };
        });

        useMutationMock.mockImplementation((options: { onSuccess?: (data: { msg: string }) => void }) => {
            const currentIndex = mutationCallIndex % 2;
            mutationCallIndex += 1;

            return {
                mutate: (payload: unknown) => {
                    if (currentIndex === 0) {
                        mutateSaveMock(payload);
                        options.onSuccess?.({ msg: "tag atualizada" });
                        return;
                    }

                    mutateCreateMock(payload);
                    options.onSuccess?.({ msg: "tag criada" });
                },
            };
        });

        render(
            <TagsProvider>
                <TagsConsumer />
            </TagsProvider>,
        );

        expect(screen.getByTestId("tags-size")).toHaveTextContent("1");
        expect(screen.getByTestId("open-drawer")).toHaveTextContent("false");

        fireEvent.click(screen.getByText("open"));
        expect(screen.getByTestId("open-drawer")).toHaveTextContent("true");

        fireEvent.click(screen.getByText("close"));
        expect(screen.getByTestId("open-drawer")).toHaveTextContent("false");

        fireEvent.click(screen.getByText("update"));
        fireEvent.click(screen.getByText("create"));

        expect(mutateSaveMock).toHaveBeenCalled();
        expect(mutateCreateMock).toHaveBeenCalledWith({ name: "Nova", color: "#ffffff" });
        expect(refetchMock).toHaveBeenCalledTimes(2);
        expect(messageSuccessMock).toHaveBeenCalledTimes(2);
    });

    test("usa fallback quando queries não retornam dados", () => {
        useQueryMock.mockImplementation((options: { queryKey?: unknown[] }) => {
            if (options?.queryKey?.[0] === "tags") {
                return {
                    data: undefined,
                    isLoading: true,
                    refetch: jest.fn(),
                };
            }

            return {
                data: undefined,
                isLoading: true,
            };
        });
        useMutationMock.mockImplementation(() => ({ mutate: jest.fn() }));

        render(
            <TagsProvider>
                <TagsConsumer />
            </TagsProvider>,
        );

        expect(screen.getByTestId("loading")).toHaveTextContent("true");
        expect(screen.getByTestId("tags-size")).toHaveTextContent("0");
        expect(screen.getByTestId("tag-detail")).toHaveTextContent("{}");
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useTags())).toThrow("useTags must be used within TagsProvider");
    });
});
