import { sessionGate } from "@/sessionGate";
import * as Sentry from "@sentry/nextjs";
import { AxiosError, HttpStatusCode } from "axios";
import {
    apiAuth,
    confirmPasswordResetService,
    refreshTokenAsync,
    requestPasswordResetService,
    validatePasswordResetTokenService,
} from ".";

const getRejectedInterceptor = () =>
    (apiAuth.interceptors.response as unknown as { handlers: Array<{ rejected: (error: AxiosError) => Promise<unknown> }> })
        .handlers[0].rejected;

const makeAxiosError = (status?: number, config: Record<string, unknown> = { url: "/secure" }) => {
    const error = new AxiosError("request failed");
    error.config = config as AxiosError["config"];

    if (typeof status === "number") {
        error.response = {
            status,
            data: {},
            headers: {},
            statusText: "",
            config: config as AxiosError["config"],
        };
    }

    return error;
};

describe("auth service interceptors", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("refreshTokenAsync resolve com status 200", async () => {
        const postSpy = jest.spyOn(apiAuth, "post").mockResolvedValue({ status: 200, data: { msg: "ok" } } as never);

        await expect(refreshTokenAsync()).resolves.toEqual({ msg: "ok" });
        expect(postSpy).toHaveBeenCalledWith("token/refresh/");
    });

    test("refreshTokenAsync rejeita quando refresh retorna status diferente de 200", async () => {
        jest.spyOn(apiAuth, "post").mockResolvedValue({ status: 500, data: {} } as never);

        await expect(refreshTokenAsync()).rejects.toThrow("Falha ao atualizar o token");
    });

    test("refreshTokenAsync dispara evento em erro 403", async () => {
        const dispatchSpy = jest.spyOn(window, "dispatchEvent");
        const forbiddenError = makeAxiosError(HttpStatusCode.Forbidden);

        jest.spyOn(apiAuth, "post").mockRejectedValue(forbiddenError);

        await expect(refreshTokenAsync()).rejects.toBe(forbiddenError);
        expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "tokenRefreshFailed" }));
    });

    test("refreshTokenAsync reutiliza a mesma promise enquanto refresh está em andamento", async () => {
        let resolvePost: (value: { status: number; data: { msg: string } }) => void = () => {};
        const postSpy = jest.spyOn(apiAuth, "post").mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolvePost = resolve;
                }) as never,
        );

        const firstCall = refreshTokenAsync();
        const secondCall = refreshTokenAsync();

        expect(postSpy).toHaveBeenCalledTimes(1);

        resolvePost({ status: 200, data: { msg: "ok" } });
        await expect(firstCall).resolves.toEqual({ msg: "ok" });
        await expect(secondCall).resolves.toEqual({ msg: "ok" });

        jest.spyOn(apiAuth, "post").mockResolvedValue({ status: 200, data: { msg: "next" } } as never);
        await expect(refreshTokenAsync()).resolves.toEqual({ msg: "next" });
    });

    test("interceptor rejeita e reporta no Sentry quando erro não tem response.status", async () => {
        const rejected = getRejectedInterceptor();
        const error = makeAxiosError(undefined);

        await expect(rejected(error)).rejects.toBe(error);
        expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });

    test("interceptor rejeita quando refresh falha em 401 com sessão ativa", async () => {
        const rejected = getRejectedInterceptor();
        const refreshError = new Error("refresh failed");
        const error = makeAxiosError(HttpStatusCode.Unauthorized, { url: "/secure", method: "get" });

        jest.spyOn(sessionGate, "isActive").mockReturnValue(true);
        jest.spyOn(apiAuth, "post").mockRejectedValue(refreshError);

        await expect(rejected(error)).rejects.toThrow("refresh failed");
        expect(Sentry.captureException).toHaveBeenCalledWith(refreshError);
    });

    test("interceptor dispara tokenRefreshFailed para 403 e reporta no Sentry", async () => {
        const rejected = getRejectedInterceptor();
        const dispatchSpy = jest.spyOn(window, "dispatchEvent");
        const error = makeAxiosError(HttpStatusCode.Forbidden);

        jest.spyOn(sessionGate, "isActive").mockReturnValue(false);

        await expect(rejected(error)).rejects.toBe(error);
        expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: "tokenRefreshFailed" }));
        expect(Sentry.captureException).toHaveBeenCalledWith(error);
    });
});

describe("password reset services", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("requestPasswordResetService faz POST no endpoint correto", async () => {
        const postSpy = jest.spyOn(apiAuth, "post").mockResolvedValue({ data: { msg: "ok" } } as never);

        await requestPasswordResetService({ email: "email@site.com" });

        expect(postSpy).toHaveBeenCalledWith("password-reset/request/", { email: "email@site.com" });
    });

    test("validatePasswordResetTokenService faz GET com token em params", async () => {
        const getSpy = jest.spyOn(apiAuth, "get").mockResolvedValue({ data: { valid: true } } as never);

        await validatePasswordResetTokenService("abc123");

        expect(getSpy).toHaveBeenCalledWith("password-reset/validate/", { params: { token: "abc123" } });
    });

    test("confirmPasswordResetService faz POST com payload do token", async () => {
        const postSpy = jest.spyOn(apiAuth, "post").mockResolvedValue({ data: { msg: "ok" } } as never);

        await confirmPasswordResetService({ token: "abc123", new_password: "secret" });

        expect(postSpy).toHaveBeenCalledWith("password-reset/confirm/", { token: "abc123", new_password: "secret" });
    });
});
