import axios from "axios";
import React from "react";

global.IntersectionObserver = jest.fn();

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

Object.defineProperty(window, "getComputedStyle", {
    value: () => ({
        getPropertyValue: () => "",
    }),
});

jest.mock("@sentry/nextjs", () => ({
    captureMessage: jest.fn(),
    captureException: jest.fn(),
}));

if (typeof MessageChannel === "undefined") {
    global.MessageChannel = function () {
        return {
            port1: {
                close: () => {},
                postMessage: () => {},
                onmessage: null,
            },
            port2: {
                close: () => {},
                postMessage: () => {},
                onmessage: null,
            },
        };
    };
}

jest.mock("next/navigation", () => {
    return {
        useRouter: () => ({
            push: jest.fn(),
            replace: jest.fn(),
            refresh: jest.fn(),
            back: jest.fn(),
            forward: jest.fn(),
            prefetch: jest.fn(),
        }),
        usePathname: () => "/",
        useSearchParams: () => ({
            get: jest.fn(),
        }),
    };
});

jest.mock("antd", () => {
    const antd = jest.requireActual("antd");

    const Select = ({ value, onChange, mode, options = [], ...rest }) => {
        const handleChange = (e) => {
            const val = e.target.value;

            if (mode === "multiple") {
                onChange?.([val]);
            } else {
                onChange?.(val);
            }
        };

        return (
            <select
                data-testid={rest["data-testid"] ?? "mock-select"}
                value={value}
                multiple={mode === "multiple"}
                onChange={handleChange}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    };

    Select.Option = ({ children, ...otherProps }) => {
        return <option {...otherProps}>{children}</option>;
    };

    return {
        ...antd,
        Select,
    };
});
