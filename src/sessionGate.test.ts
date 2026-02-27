import { sessionGate } from "./sessionGate";

describe("sessionGate", () => {
    beforeEach(() => {
        sessionGate.reset();
    });

    it("inicia como active", () => {
        expect(sessionGate.isActive()).toBe(true);
    });

    it("isActive retorna false após startInvalidation", () => {
        sessionGate.startInvalidation();
        expect(sessionGate.isActive()).toBe(false);
    });

    it("isActive retorna false após invalidate", () => {
        sessionGate.invalidate();
        expect(sessionGate.isActive()).toBe(false);
    });

    it("reset restaura o estado para active", () => {
        sessionGate.invalidate();
        sessionGate.reset();
        expect(sessionGate.isActive()).toBe(true);
    });

    it("startInvalidation não quebra ao chamar em sequência", () => {
        sessionGate.startInvalidation();
        sessionGate.startInvalidation();
        expect(sessionGate.isActive()).toBe(false);
    });
});
