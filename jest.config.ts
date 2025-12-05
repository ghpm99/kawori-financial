import nextJest from "next/jest.js";
import type { Config } from "jest";

const createJestConfig = nextJest({
    dir: "./",
});

const config: Config = {
    testEnvironment: "jsdom",

    setupFiles: ["<rootDir>/src/jest.setupFiles.js"],
    setupFilesAfterEnv: ["<rootDir>/src/jest.setupFilesAfterEnv.js"],

    moduleNameMapper: {
        "^dexie$": "<rootDir>/node_modules/dexie",
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    transformIgnorePatterns: ["node_modules/(?!@faker-js).+"],
    collectCoverageFrom: [
        "src/**/*.ts",
        "src/**/*.tsx",
        "!src/**/*.d.ts",
        "!src/instrumentation.ts",
        "!src/app/storeProvider.tsx",
        "!src/app/slice-simulator.tsx",
        "!src/slices/**/*",
    ],

    coverageProvider: "v8",
    // coverageThreshold: {
    //     global: {
    //         branches: 80,
    //         functions: 65,
    //         lines: 50,
    //         statements: 50,
    //     },
    // },
};

export default createJestConfig(config);
