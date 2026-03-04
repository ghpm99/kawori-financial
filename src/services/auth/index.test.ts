import {
    apiAuth,
    refreshTokenService,
    resendEmailVerificationService,
    signinService,
    socialAccountsService,
    socialAuthorizeService,
    socialProvidersService,
    signoutService,
    signupService,
    unlinkSocialAccountService,
    verifyEmailService,
    verifyTokenService,
} from ".";

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

            expect(postSpy).toHaveBeenCalledWith("token/", { username: "user", password: "pass" });
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
            postSpy.mockResolvedValueOnce({ data: { msg: "Token valido" } });

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

    describe("email verification services", () => {
        it("chama POST email/verify/ com token", async () => {
            postSpy.mockResolvedValueOnce({ data: { msg: "ok" }, status: 200 } as any);

            await verifyEmailService({ token: "abc123" });

            expect(postSpy).toHaveBeenCalledWith("email/verify/", { token: "abc123" });
        });

        it("chama POST email/resend-verification/ sem payload", async () => {
            postSpy.mockResolvedValueOnce({ data: { msg: "ok" }, status: 200 } as any);

            await resendEmailVerificationService();

            expect(postSpy).toHaveBeenCalledWith("email/resend-verification/");
        });
    });

    describe("social auth services", () => {
        it("chama GET social/providers/", async () => {
            getSpy.mockResolvedValueOnce({
                data: {
                    providers: [{ provider: "google", name: "Google", scopes: ["openid"] }],
                },
                status: 200,
            } as any);

            await socialProvidersService();

            expect(getSpy).toHaveBeenCalledWith("social/providers/");
        });

        it("chama GET social/<provider>/authorize/ com query params", async () => {
            getSpy.mockResolvedValueOnce({
                data: { provider: "google", mode: "login", authorize_url: "https://accounts.google.com" },
                status: 200,
            } as any);

            await socialAuthorizeService("google", {
                mode: "login",
                frontend_redirect_uri: "https://frontend.app/internal/financial",
            });

            expect(getSpy).toHaveBeenCalledWith("social/google/authorize/", {
                params: {
                    mode: "login",
                    frontend_redirect_uri: "https://frontend.app/internal/financial",
                },
            });
        });

        it("chama GET social/accounts/", async () => {
            getSpy.mockResolvedValueOnce({
                data: {
                    accounts: [],
                },
                status: 200,
            } as any);

            await socialAccountsService();

            expect(getSpy).toHaveBeenCalledWith("social/accounts/");
        });

        it("chama POST social/accounts/<provider>/unlink/", async () => {
            postSpy.mockResolvedValueOnce({
                data: { msg: "Conta social desvinculada." },
                status: 200,
            } as any);

            await unlinkSocialAccountService("google");

            expect(postSpy).toHaveBeenCalledWith("social/accounts/google/unlink/");
        });
    });
});
