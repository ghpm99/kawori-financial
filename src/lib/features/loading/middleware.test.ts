import { _registerEffect } from "./middleware";

describe("_registerEffect", () => {
    const initialState: LoadingState = {
        global: false,
        slices: {},
        effects: {},
        requests: {},
    };

    test("should initialize state correctly when slice, effect, and requests are not present", () => {
        const args = {
            initialState,
            slice: "testSlice",
            effect: "testSlice/testEffect",
            lifecycle: "pending",
            requestId: "request1",
        };

        const result = _registerEffect(args);

        expect(result.slices["testSlice"]).toBe("pending");
        expect(result.effects["testSlice/testEffect"]).toBe("pending");
        expect(result.requests["testSlice/testEffect"]).toEqual(["request1"]);
        expect(result.global).toBe(true);
    });

    test("should update state correctly when lifecycle is pending", () => {
        const args = {
            initialState: {
                ...initialState,
                slices: { testSlice: "starting" },
                effects: { "testSlice/testEffect": "starting" },
                requests: { "testSlice/testEffect": [] },
            },
            slice: "testSlice",
            effect: "testSlice/testEffect",
            lifecycle: "pending",
            requestId: "request1",
        };

        const result = _registerEffect(args);

        expect(result.slices["testSlice"]).toBe("pending");
        expect(result.effects["testSlice/testEffect"]).toBe("pending");
        expect(result.requests["testSlice/testEffect"]).toEqual(["request1"]);
        expect(result.global).toBe(true);
    });

    test("should update state correctly when lifecycle is fulfilled", () => {
        const args = {
            initialState: {
                ...initialState,
                slices: { testSlice: "pending" },
                effects: { "testSlice/testEffect": "pending" },
                requests: { "testSlice/testEffect": ["request1"] },
            },
            slice: "testSlice",
            effect: "testSlice/testEffect",
            lifecycle: "fulfilled",
            requestId: "request1",
        };

        const result = _registerEffect(args);

        expect(result.slices["testSlice"]).toBe("idle");
        expect(result.effects["testSlice/testEffect"]).toBe("idle");
        expect(result.requests["testSlice/testEffect"]).toEqual([]);
        expect(result.global).toBe(false);
    });

    test("should update state correctly when lifecycle is rejected", () => {
        const args = {
            initialState: {
                ...initialState,
                slices: { testSlice: "pending" },
                effects: { "testSlice/testEffect": "pending" },
                requests: { "testSlice/testEffect": ["request1"] },
            },
            slice: "testSlice",
            effect: "testSlice/testEffect",
            lifecycle: "rejected",
            requestId: "request1",
        };

        const result = _registerEffect(args);

        expect(result.slices["testSlice"]).toBe("failed");
        expect(result.effects["testSlice/testEffect"]).toBe("failed");
        expect(result.requests["testSlice/testEffect"]).toEqual([]);
        expect(result.global).toBe(false);
    });

    test("should handle multiple requests correctly", () => {
        const args = {
            initialState: {
                ...initialState,
                slices: { testSlice: "pending" },
                effects: { "testSlice/testEffect": "pending" },
                requests: { "testSlice/testEffect": ["request1", "request2"] },
            },
            slice: "testSlice",
            effect: "testSlice/testEffect",
            lifecycle: "fulfilled",
            requestId: "request1",
        };

        const result = _registerEffect(args);

        expect(result.slices["testSlice"]).toBe("pending");
        expect(result.effects["testSlice/testEffect"]).toBe("pending");
        expect(result.requests["testSlice/testEffect"]).toEqual(["request2"]);
        expect(result.global).toBe(true);
    });
});
