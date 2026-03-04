import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import EmailStep from "./emailStep";
import NewPasswordStep from "./newPasswordStep";
import SuccessStep from "./successStep";
import TokenStep from "./tokenStep";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

describe("reset password steps", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("EmailStep envia email", async () => {
        const onSuccess = jest.fn();
        render(<EmailStep onSuccess={onSuccess} isLoading={false} />);

        fireEvent.change(screen.getByPlaceholderText("E-mail"), { target: { value: "mail@test.com" } });
        fireEvent.click(screen.getByRole("button", { name: /Enviar link de redefinição/i }));

        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("mail@test.com"));
    });

    test("TokenStep envia token", async () => {
        const onSuccess = jest.fn();
        render(<TokenStep onSuccess={onSuccess} isLoading={false} />);

        fireEvent.change(screen.getByPlaceholderText(/Cole o token/i), { target: { value: "abc123" } });
        fireEvent.click(screen.getByRole("button", { name: /Validar token/i }));

        await waitFor(() => expect(onSuccess).toHaveBeenCalledWith("abc123"));
    });

    test("NewPasswordStep renderiza erro em lista", () => {
        render(<NewPasswordStep onSuccess={jest.fn()} isLoading={false} errorMessage={["erro 1", "erro 2"]} />);

        expect(screen.getByText("erro 1")).toBeInTheDocument();
        expect(screen.getByText("erro 2")).toBeInTheDocument();
    });

    test("NewPasswordStep renderiza erro simples", () => {
        render(<NewPasswordStep onSuccess={jest.fn()} isLoading={false} errorMessage="erro simples" />);
        expect(screen.getByText("erro simples")).toBeInTheDocument();
    });

    test("SuccessStep faz contagem e redireciona", () => {
        jest.useFakeTimers();
        render(<SuccessStep />);

        expect(screen.getByText(/15s/i)).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(15000);
        });

        expect(pushMock).toHaveBeenCalledWith("/signin");
        jest.useRealTimers();
    });
});
