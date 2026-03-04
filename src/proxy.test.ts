const nextMock = jest.fn(() => "next-result");
const redirectMock = jest.fn(() => "redirect-result");

jest.mock("next/server", () => ({
    NextResponse: {
        next: () => nextMock(),
        redirect: (url: URL) => redirectMock(url),
    },
}));

import { proxy } from "./proxy";

describe("proxy middleware", () => {
    beforeEach(() => {
        nextMock.mockClear();
        redirectMock.mockClear();
    });

    const makeRequest = (pathname: string, authenticated = false) =>
        ({
            nextUrl: {
                pathname,
                clone: () => new URL(`https://financeiro.kawori.site${pathname}`),
            },
            cookies: {
                get: (name: string) => (authenticated && name === "lifetimetoken" ? { value: "token" } : undefined),
            },
        }) as any;

    test("redireciona usuário não autenticado em rota privada", () => {
        const request = makeRequest("/internal/financial");

        proxy(request);

        expect(redirectMock).toHaveBeenCalled();
        const url = redirectMock.mock.calls[0][0] as URL;
        expect(url.pathname).toBe("/");
    });

    test("redireciona usuário autenticado em rota pública com redirect", () => {
        const request = makeRequest("/facetexture", true);

        proxy(request);

        expect(redirectMock).toHaveBeenCalled();
        const url = redirectMock.mock.calls[0][0] as URL;
        expect(url.pathname).toBe("/internal/facetexture");
    });

    test("permite seguir quando autenticado e rota privada", () => {
        const request = makeRequest("/admin", true);

        proxy(request);

        expect(nextMock).toHaveBeenCalled();
    });

    test("permite seguir em rota pública", () => {
        const request = makeRequest("/rank");

        proxy(request);

        expect(nextMock).toHaveBeenCalled();
    });
});
