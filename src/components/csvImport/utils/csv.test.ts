import { parseCSVText, parseDateToISO } from "./csv";

describe("csv utils", () => {
    test("parseCSVText parseia cabeçalho e linhas", () => {
        const content = "name;value\nCasa;100\nMercado;250";
        const result = parseCSVText(content);

        expect(result.headers).toEqual(["name", "value"]);
        expect(result.data).toEqual([
            { name: "Casa", value: "100" },
            { name: "Mercado", value: "250" },
        ]);
    });

    test("parseCSVText suporta campos com vírgula entre aspas", () => {
        const content = 'name,desc\nCasa,"conta, fixa"';
        const result = parseCSVText(content);

        expect(result.data[0].desc).toBe("conta, fixa");
    });

    test("parseDateToISO converte múltiplos formatos", () => {
        expect(parseDateToISO("2026-03-03")).toBe("2026-03-03");
        expect(parseDateToISO("03/03/2026")).toBe("2026-03-03");
        expect(parseDateToISO("03-03-2026")).toBe("2026-03-03");
        expect(parseDateToISO("March 3, 2026")).toBe("2026-03-03");
        expect(parseDateToISO("")).toBeNull();
        expect(parseDateToISO("inválida")).toBeNull();
    });
});
