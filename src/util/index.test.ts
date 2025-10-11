import { formatMoney, formatterDate, formatterDetailedDate, formatterMonthYearDate, normalizeString } from "./index";

describe("Utility Functions", () => {
    describe("formatMoney", () => {
        test("should format money correctly with default parameters", () => {
            expect(formatMoney(1234567.89)).toBe("R$ 1.234.567,89");
        });

        test("should format money correctly with custom parameters", () => {
            expect(formatMoney(1234567.89, 2, ".", ",", "$")).toBe("R$ 1.234.567,89");
        });

        test("should handle negative amounts correctly", () => {
            expect(formatMoney(-1234567.89)).toBe("-R$ 1.234.567,89");
        });

        test("should handle zero correctly", () => {
            expect(formatMoney(0)).toBe("R$ 0,00");
        });
    });

    describe("formatterDate", () => {
        test("should format date correctly", () => {
            expect(formatterDate("2023-10-05")).toBe("05/10/2023");
        });

        test("should handle invalid date string", () => {
            expect(formatterDate("invalid-date")).toBe("01/01/300");
        });
    });

    describe("formatterDetailedDate", () => {
        test("should format detailed date correctly", () => {
            expect(formatterDetailedDate("2023-10-05T14:48:00.000Z")).toBe("05/10/2023, 11:48:00");
        });

        test("should handle invalid date string", () => {
            expect(formatterDetailedDate("invalid-date")).toBe("Invalid Date");
        });
    });

    describe("formatterMonthYearDate", () => {
        test("should format month and year correctly", () => {
            expect(formatterMonthYearDate("2023-10-05")).toBe("10/2023");
        });

        test("should handle invalid date string", () => {
            expect(formatterMonthYearDate("invalid-date")).toBe("Invalid Date");
        });
    });

    describe("normalizeString", () => {
        test("should normalize string correctly", () => {
            expect(normalizeString("Hello World")).toBe("hello-world");
        });

        test("should handle empty string", () => {
            expect(normalizeString("")).toBe("");
        });
    });
});
