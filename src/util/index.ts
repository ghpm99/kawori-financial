import dayjs from "dayjs";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { Theme } from "@/styles/theme";

export const FACETEXTURE_MESSAGE_REF = "facetexture-message-ref";

export const formatMoney = (
    amount: number,
    decimalCount = 2,
    decimal = ".",
    thousands = ",",
    currencySymbol = "R$",
) => {
    if (typeof Intl === "object") {
        return new Intl.NumberFormat("pt-br", {
            style: "currency",
            currency: "BRL",
        }).format(amount);
    }
    // Fallback if Intl is not present.
    try {
        const negativeSign = amount < 0 ? "-" : "";
        const amountNumber = Math.abs(Number(amount) || 0).toFixed(decimalCount);
        const i = parseInt(amountNumber, 10).toString();
        const j = i.length > 3 ? i.length % 3 : 0;
        return (
            currencySymbol +
            negativeSign +
            (j ? i.substr(0, j) + thousands : "") +
            i.substr(j).replace(/(\d{3})(?=\d)/g, `$1${thousands}`) +
            (decimalCount
                ? decimal +
                  Math.abs(parseInt(amountNumber) - parseInt(i))
                      .toFixed(decimalCount)
                      .slice(2)
                : "")
        );
    } catch (e) {
        console.error(e);
    }
    return amount;
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
    return className.replace(" ", "-").toLowerCase();
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
