import { createContext, useContext, useState } from "react";

export type SelectedRowType = {
    id: number;
    selected: boolean;
};

type SelectPaymentsContextValue = {
    selectedRow: SelectedRowType[];
    updateSelectedRows: (keys: SelectedRowType[]) => void;
};

const SelectPaymentsContext = createContext<SelectPaymentsContextValue | undefined>(undefined);

export const SelectPaymentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedRow, setSelectedRow] = useState<SelectedRowType[]>([]);

    const updateSelectedRows = (newSelectedRows: SelectedRowType[]): void => {
        const currentIds = new Set(selectedRow.map((row) => row.id));

        const updatedRows = selectedRow.map((currentRow) => {
            const matchingNewRow = newSelectedRows.find((newRow) => newRow.id === currentRow.id);
            return matchingNewRow ? { ...currentRow, ...matchingNewRow } : currentRow;
        });

        const addedRows = newSelectedRows.filter((newRow) => !currentIds.has(newRow.id));

        setSelectedRow([...updatedRows, ...addedRows]);
    };

    return (
        <SelectPaymentsContext.Provider
            value={{
                selectedRow,
                updateSelectedRows,
            }}
        >
            {children}
        </SelectPaymentsContext.Provider>
    );
};

export const useSelectPayments = (): SelectPaymentsContextValue => {
    const ctx = useContext(SelectPaymentsContext);
    if (!ctx) throw new Error("useSelectPayments must be used within SelectPaymentsProvider");
    return ctx;
};
