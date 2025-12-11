// components/csv-import/types.ts

import { IPaymentDetail } from "../providers/payments";

export type CSVRow = { [key: string]: string };

export interface ParsedTransaction {
    id: string;
    originalRow: CSVRow;
    mappedData: Partial<IPaymentDetail>;
    validationErrors: string[];
    isValid: boolean;
    matchedPayment?: IPaymentDetail;
    matchScore?: number;
    selected: boolean;
}

export interface ColumnMapping {
    csvColumn: string;
    systemField: string;
}

export type ImportType = "transactions" | "invoices";
export type ImportStep = "type" | "upload" | "mapping" | "preview" | "reconciliation" | "confirm";
