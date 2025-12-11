import React, { createContext, useContext, useState } from "react";

type CsvImportContextValue = {
    openModal: boolean;
    setOpenModal: (open: boolean) => void;
};

const CsvImportContext = createContext<CsvImportContextValue | undefined>(undefined);

export const CsvImportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [openModal, setOpenModal] = useState(false);

    const value: CsvImportContextValue = {
        openModal,
        setOpenModal,
    };

    return <CsvImportContext.Provider value={value}>{children}</CsvImportContext.Provider>;
};

export const useCsvImportProvider = (): CsvImportContextValue => {
    const ctx = useContext(CsvImportContext);
    if (!ctx) throw new Error("useCsvImportProvider must be used within CsvImportProvider");
    return ctx;
};
