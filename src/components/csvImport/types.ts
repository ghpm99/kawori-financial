// components/csv-import/types.ts
import type { Payment } from "@/contexts/financial-context";

export type CSVRow = { [key: string]: string };

export interface ParsedTransaction {
    id: string;
    originalRow: CSVRow;
    mappedData: Partial<Payment>;
    validationErrors: string[];
    isValid: boolean;
    matchedPayment?: Payment;
    matchScore?: number;
    selected: boolean;
}

export interface ColumnMapping {
    csvColumn: string;
    systemField: string;
}

export type ImportType = "payments" | "invoices";
export type ImportStep = "upload" | "mapping" | "preview" | "reconciliation" | "confirm";
