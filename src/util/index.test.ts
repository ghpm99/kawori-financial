import {
    formatMoney,
    formatterDate,
    formatterDetailedDate,
    formatterMonthYearDate,
    normalizeString,
    addStyle,
    getSavedTheme,
    updateSearchParams,
    getStringValue,
    getNumberValue,
} from "@/util/index";
import dayjs from "dayjs";

describe("formatMoney", () => {
    test("formata valores positivos corretamente", () => {
        expect(formatMoney(1234.56).replace(/\u00A0/g, " ")).toBe("R$ 1.234,56");
    });

    test("formata valores negativos corretamente", () => {
        expect(formatMoney(-987.65).replace(/\u00A0/g, " ")).toBe("-R$ 987,65");
    });

    test("fallback funciona sem Intl", () => {
        const originalIntl = global.Intl;
        // @ts-ignore
        global.Intl = undefined;

        expect(formatMoney(1234.56)).toBe("R$ 1.234,56");

        global.Intl = originalIntl;
    });
});

describe("formatterDate", () => {
    test("formata data no padrão pt-BR", () => {
        expect(formatterDate("2024-10-05")).toBe("05/10/2024");
    });

    test("fallback quando data não contém GMT", () => {
        expect(formatterDate("2024-01-01T12:00:00")).toBe("01/01/2024");
    });
});

describe("formatterDetailedDate", () => {
    test("formata data detalhada pt-BR", () => {
        const result = formatterDetailedDate("2024-01-01T15:30:00Z");
        expect(result).toMatch(/01\/01\/2024/);
    });
});

describe("formatterMonthYearDate", () => {
    test("formata mês e ano corretamente", () => {
        expect(formatterMonthYearDate("2024-11-15")).toBe(dayjs("2024-11-15").format("MM/YYYY"));
    });
});

describe("normalizeString", () => {
    test("substitui espaços por hífen e deixa tudo minúsculo", () => {
        expect(normalizeString("Minha Classe Legal")).toBe("minha-classe-legal");
    });
});

describe("addStyle", () => {
    test("não executa em ambiente sem window", () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;

        expect(() => addStyle(".test {}")).not.toThrow();

        global.window = originalWindow;
    });

    test("adiciona um elemento <style> ao documento", () => {
        document.head.innerHTML = "";
        addStyle(".my-style { color: red; }");

        const styleEl = document.head.querySelector("style");
        expect(styleEl).not.toBeNull();
        expect(styleEl!.textContent).toBe(".my-style { color: red; }");
    });
});

describe("getSavedTheme", () => {
    test("retorna light se window não existir", () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;

        expect(getSavedTheme()).toBe("light");

        global.window = originalWindow;
    });

    test("retorna tema salvo no localStorage", () => {
        localStorage.setItem("theme", "dark");
        expect(getSavedTheme()).toBe("dark");

        localStorage.setItem("theme", "light");
        expect(getSavedTheme()).toBe("light");
    });

    test("retorna light se valor inválido", () => {
        localStorage.setItem("theme", "blue");
        expect(getSavedTheme()).toBe("light");
    });
});

describe("updateSearchParams", () => {
    test("constrói URL com os filtros corretos", () => {
        const pushMock = jest.fn();
        const router = { push: pushMock };

        updateSearchParams(router as any, "/dashboard", { page: 2, search: "abc", empty: "", nullValue: null });

        expect(pushMock).toHaveBeenCalledWith("/dashboard?page=2&search=abc");
    });

    test("não envia filtros vazios", () => {
        const pushMock = jest.fn();
        const router = { push: pushMock };

        updateSearchParams(router as any, "/home", { a: "", b: undefined, c: null });

        expect(pushMock).toHaveBeenCalledWith("/home");
    });
});

describe("getStringValue", () => {
    test("retorna string se valor for string", () => {
        expect(getStringValue("abc")).toBe("abc");
    });

    test("retorna primeiro elemento caso seja array", () => {
        expect(getStringValue(["x", "y"])).toBe("x");
    });

    test("retorna undefined para undefined", () => {
        expect(getStringValue(undefined)).toBeUndefined();
    });
});

describe("getNumberValue", () => {
    test("converte string numérica corretamente", () => {
        expect(getNumberValue("123")).toBe(123);
    });

    test("pega primeiro valor se array", () => {
        expect(getNumberValue(["50", "99"])).toBe(50);
    });

    test("retorna undefined para valores inválidos", () => {
        expect(getNumberValue("abc")).toBeUndefined();
        expect(getNumberValue(undefined)).toBeUndefined();
    });
});
