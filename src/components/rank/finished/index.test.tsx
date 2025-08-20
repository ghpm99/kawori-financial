import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Finished from "./index";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
    useRouter: jest.fn(),
}));

describe("Finished Component", () => {
    test("should render the card title correctly", () => {
        render(<Finished />);
        const cardTitle = screen.getByRole("heading", { level: 2 });
        expect(cardTitle).toHaveTextContent("Concluído");
    });

    test("should render the success message", () => {
        render(<Finished />);
        const successMessage = screen.getByText("Obrigado por votar!");
        expect(successMessage).toBeInTheDocument();
    });

    test("should render the subtitle message", () => {
        render(<Finished />);
        const subTitleMessage = screen.getByText("Seu voto foi recebido e está sendo processado!");
        expect(subTitleMessage).toBeInTheDocument();
    });

    test("should render the button with correct text", () => {
        render(<Finished />);
        const button = screen.getByRole("button", { name: /Voltar/i });
        expect(button).toBeInTheDocument();
    });

    test("should have a link to the correct URL", () => {
        render(<Finished />);
        const link = screen.getByRole("link", { name: /Voltar/i });
        expect(link).toHaveAttribute("href", "/internal/rank");
    });
});
