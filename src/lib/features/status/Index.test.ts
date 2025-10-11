import statusReducer, { setCpuAndMemoryValue } from "./Index";

describe("statusSlice reducer", () => {
    const initialState = {
        cpu: 0,
        memory: 0,
    };

    test("should handle initial state", () => {
        expect(statusReducer(undefined, { type: "unknown" })).toEqual(initialState);
    });

    test("should handle setCpuAndMemoryValue", () => {
        const actual = statusReducer(initialState, setCpuAndMemoryValue({ cpu: 50, memory: 1024 }));
        expect(actual.cpu).toEqual(50);
        expect(actual.memory).toEqual(1024);
    });
});
