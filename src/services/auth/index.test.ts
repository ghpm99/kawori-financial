import { apiAuth, signinService, signupService, verifyTokenService, signoutService, refreshTokenService } from ".";

describe("authService", () => {
    let postSpy: jest.SpyInstance;
    let getSpy: jest.SpyInstance;

    beforeEach(() => {
        postSpy = jest.spyOn(apiAuth, "post").mockResolvedValue({ data: {}, status: 200 } as any);
        getSpy = jest.spyOn(apiAuth, "get").mockResolvedValue({ data: {}, status: 200 } as any);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("signinService", () => {
        it("chama POST token/ com as credenciais", async () => {
            const args = { username: "user", password: "pass", remember: true };
            postSpy.mockResolvedValueOnce({ data: { refresh_token_expiration: "2025-01-01" } });

            await signinService(args);

            expect(postSpy).toHaveBeenCalledWith("token/", args);
        });
    });

    describe("signupService", () => {
        it("chama POST signup com dados do novo usuário", async () => {
            const user = { username: "new", password: "pass", email: "a@b.com", name: "João", last_name: "Silva" };
            postSpy.mockResolvedValueOnce({ data: { msg: "Cadastrado" } });

            await signupService(user);

            expect(postSpy).toHaveBeenCalledWith("signup", user);
        });
    });

    describe("verifyTokenService", () => {
        it("chama POST token/verify/", async () => {
            postSpy.mockResolvedValueOnce({ data: { msg: "Token válido" } });

            await verifyTokenService();

            expect(postSpy).toHaveBeenCalledWith("token/verify/");
        });
    });

    describe("signoutService", () => {
        it("chama GET signout", async () => {
            getSpy.mockResolvedValueOnce({ data: {} });

            await signoutService();

            expect(getSpy).toHaveBeenCalledWith("signout");
        });
    });

    describe("refreshTokenService", () => {
        it("chama POST token/refresh/ e retorna a resposta", async () => {
            postSpy.mockResolvedValueOnce({ status: 200, data: { msg: "ok" } });

            const result = await refreshTokenService();

            expect(postSpy).toHaveBeenCalledWith("token/refresh/");
            expect(result).toEqual({ status: 200, data: { msg: "ok" } });
        });

        it("propaga erro quando o refresh falha", async () => {
            const err = new Error("Refresh failed");
            postSpy.mockRejectedValueOnce(err);

            await expect(refreshTokenService()).rejects.toThrow("Refresh failed");
        });
    });
});
