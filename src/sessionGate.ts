let sessionStatus: "active" | "invalidating" | "invalid" = "active";

export const sessionGate = {
    isActive() {
        return sessionStatus === "active";
    },
    startInvalidation() {
        sessionStatus = "invalidating";
    },
    invalidate() {
        sessionStatus = "invalid";
    },
    reset() {
        sessionStatus = "active";
    },
};
