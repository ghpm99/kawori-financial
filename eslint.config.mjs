import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
    {
        ignores: [".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"],
    },
    ...nextVitals,
    ...nextTs,
    {
        files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx", "**/__tests__/**/*.{ts,tsx}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "react/display-name": "off",
        },
    },
    {
        files: ["src/jest.setupFiles.js", "src/jest.setupFilesAfterEnv.js"],
        rules: {
            "@typescript-eslint/no-unused-vars": "off",
        },
    },
]);
