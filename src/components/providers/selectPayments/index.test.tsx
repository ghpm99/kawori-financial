import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";

import { SelectPaymentsProvider, useSelectPayments } from "./index";

const Consumer = () => {
    const { selectedRow, updateSelectedRows, clearSelection } = useSelectPayments();

    return (
        <div>
            <span data-testid="selected-row">{JSON.stringify(selectedRow)}</span>
            <button
                onClick={() =>
                    updateSelectedRows([
                        { id: 1, name: "Conta 1", selected: true },
                        { id: 2, name: "Conta 2", selected: false },
                    ])
                }
            >
                fill
            </button>
            <button onClick={() => updateSelectedRows([{ id: 1, name: "Conta 1 editada", selected: false }])}>
                update
            </button>
            <button onClick={clearSelection}>clear</button>
        </div>
    );
};

describe("SelectPaymentsProvider", () => {
    test("adiciona e atualiza selected rows mantendo itens existentes", () => {
        render(
            <SelectPaymentsProvider>
                <Consumer />
            </SelectPaymentsProvider>,
        );

        fireEvent.click(screen.getByText("fill"));
        expect(screen.getByTestId("selected-row")).toHaveTextContent('"id":1');
        expect(screen.getByTestId("selected-row")).toHaveTextContent('"id":2');

        fireEvent.click(screen.getByText("update"));
        expect(screen.getByTestId("selected-row")).toHaveTextContent("Conta 1 editada");
        expect(screen.getByTestId("selected-row")).toHaveTextContent('"id":2');
    });

    test("limpa seleção", () => {
        render(
            <SelectPaymentsProvider>
                <Consumer />
            </SelectPaymentsProvider>,
        );

        fireEvent.click(screen.getByText("fill"));
        fireEvent.click(screen.getByText("clear"));

        expect(screen.getByTestId("selected-row")).toHaveTextContent("[]");
    });

    test("hook fora do provider lança erro", () => {
        expect(() => renderHook(() => useSelectPayments())).toThrow(
            "useSelectPayments must be used within SelectPaymentsProvider",
        );
    });

    test("clearSelection também funciona via hook", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <SelectPaymentsProvider>{children}</SelectPaymentsProvider>
        );
        const { result } = renderHook(() => useSelectPayments(), { wrapper });

        act(() => {
            result.current.updateSelectedRows([{ id: 99, name: "Linha", selected: true }]);
        });
        expect(result.current.selectedRow).toHaveLength(1);

        act(() => {
            result.current.clearSelection();
        });
        expect(result.current.selectedRow).toEqual([]);
    });
});
