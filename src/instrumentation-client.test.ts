jest.mock("@sentry/nextjs", () => ({
    init: jest.fn(),
    replayIntegration: jest.fn(() => "replay"),
    captureRouterTransitionStart: jest.fn(),
}));

import * as Sentry from "@sentry/nextjs";

describe("instrumentation-client", () => {
    test("inicializa Sentry e exporta callback de transição", async () => {
        const instrumentationModule = await import("./instrumentation-client");

        expect(Sentry.replayIntegration).toHaveBeenCalled();
        expect(Sentry.init).toHaveBeenCalledWith(
            expect.objectContaining({
                integrations: ["replay"],
                tracesSampleRate: 1,
                enableLogs: true,
                replaysSessionSampleRate: 0.1,
                replaysOnErrorSampleRate: 1,
                sendDefaultPii: true,
            }),
        );
        expect(instrumentationModule.onRouterTransitionStart).toBe((Sentry as any).captureRouterTransitionStart);
    });
});
