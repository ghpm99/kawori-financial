import dayjs from "dayjs";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { Theme } from "@/styles/theme";

export const FACETEXTURE_MESSAGE_REF = "facetexture-message-ref";

export const formatMoney = (
    amount: number,
    decimalCount = 2,
    decimal = ",",
    thousands = ".",
    currencySymbol = "R$",
) => {
    if (typeof Intl === "object") {
        return new Intl.NumberFormat("pt-br", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    }
    // Fallback if Intl is not present.

    const negative = amount < 0 ? "-" : "";
    const value = Math.abs(amount);

    // força casas decimais corretas
    const fixed = value.toFixed(decimalCount); // ex: "1234.56"
    const [intPart, decimalPart] = fixed.split(".");

    // adiciona separador de milhares
    const intWithThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);

    // monta resultado final
    return `${negative}${currencySymbol} ${intWithThousands}${decimal}${decimalPart}`;
};

export const formatterDate = (dateString: string) => {
    let date = new Date(dateString + " GMT-0300");
    if (isNaN(date.getTime())) {
        date = new Date(dateString);
    }
    return date.toLocaleDateString("pt-BR");
};

export const formatterDetailedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
};

export const formatterMonthYearDate = (dateString: string) => {
    return dayjs(dateString).format("MM/YYYY");
};

export const normalizeString = (className: string): string => {
    return className.replaceAll(" ", "-").toLowerCase();
};

export const addStyle = (styleString: string) => {
    if (typeof window === "undefined") return;
    const style = document.createElement("style");
    style.textContent = styleString;
    document.head.append(style);
};

export const getSavedTheme = (): Theme => {
    if (typeof window === "undefined") return "light";
    const localTheme = localStorage.getItem("theme");
    return localTheme === "dark" ? "dark" : "light";
};

export const updateSearchParams = (router: AppRouterInstance, pathname: string, filters: object) => {
    const current = new URLSearchParams();

    for (const filter in filters) {
        const value = filters[filter as keyof typeof filters];
        if (value === null || value === undefined || value === "") continue;
        current.set(filter, String(value));
    }

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.push(`${pathname}${query}`);
};

export const getStringValue = (value: string | string[] | undefined): string | undefined => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
};

export const getNumberValue = (value: string | string[] | undefined): number | undefined => {
    const strValue = getStringValue(value);
    if (!strValue) return undefined;
    const num = Number(strValue);
    return isNaN(num) ? undefined : num;
};
