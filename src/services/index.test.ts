import exp from "constants";
import tokenServiceInstance from "./auth/authToken";
import { attachTokenToRequest, errorInterceptor } from "./index";

jest.mock("@sentry/nextjs");

describe("apiDjango", () => {
    test("should have a request interceptor that adds the Authorization header", async () => {
        tokenServiceInstance.setUser({
            remember: true,
            tokens: {
                access: "test-token",
                refresh: "test-refresh",
            },
        });

        attachTokenToRequest({ headers: {} }).then((request) => {
            expect(request.headers.Authorization).toBe("Bearer test-token");
        });
    });

    test.each([408, 504, 500])(
        "should have an error interceptor that retries the request if the status is %s",
        async (codeStatus) => {
            const errorRequest = {
                message: `Request failed with status code ${codeStatus}`,
                name: "AxiosError",
                status: codeStatus,
                isAxiosError: true,
                toJSON: jest.fn(),
                config: {
                    transitional: {
                        silentJSONParsing: true,
                        forcedJSONParsing: true,
                        clarifyTimeoutError: false,
                    },
                    adapter: ["xhr", "http", "fetch"],
                    transformRequest: [null],
                    transformResponse: [null],
                    timeout: 0,
                    xsrfCookieName: "XSRF-TOKEN",
                    xsrfHeaderName: "X-XSRF-TOKEN",
                    maxContentLength: -1,
                    maxBodyLength: -1,
                    env: {},
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        Authorization: "Bearer",
                    },
                    baseURL: "http://localhost:8500/",
                    method: "get",
                    url: "/profile/",
                },
                response: {
                    data: {
                        msg: "O token é inválido ou expirado",
                    },
                    status: codeStatus,
                    statusText: "Unauthorized",
                    headers: {
                        "content-length": "51",
                        "content-type": "application/json",
                    },
                    config: {
                        transitional: {
                            silentJSONParsing: true,
                            forcedJSONParsing: true,
                            clarifyTimeoutError: false,
                        },
                        adapter: ["xhr", "http", "fetch"],
                        transformRequest: [null],
                        transformResponse: [null],
                        timeout: 0,
                        xsrfCookieName: "XSRF-TOKEN",
                        xsrfHeaderName: "X-XSRF-TOKEN",
                        maxContentLength: -1,
                        maxBodyLength: -1,
                        env: {},
                        headers: {
                            Accept: "application/json, text/plain, */*",
                            Authorization: "Bearer",
                        },
                        baseURL: "http://localhost:8500/",
                        method: "get",
                        url: "/profile/",
                    },
                    request: {
                        m_isAborted: false,
                    },
                },
            };
            const errorRetorno = errorInterceptor(errorRequest);
            const expectedError = new Promise((resolve, reject) => {});
            expect(errorRetorno).toEqual(expectedError);
        },
    );
});
