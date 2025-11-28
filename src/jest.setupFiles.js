import axios from "axios";

global.IntersectionObserver = jest.fn()

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

jest.mock("@sentry/nextjs", () => ({
    captureMessage: jest.fn(),
    captureException: jest.fn(),
}));