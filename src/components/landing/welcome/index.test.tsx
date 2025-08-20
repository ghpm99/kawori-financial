import React from "react";
import { render } from "@testing-library/react";

import Welcome from "./index";

describe("Welcome Component", () => {
    test("renders the main title", () => {
        const { getByText } = render(<Welcome />);
        const mainTitle = getByText("Bem vindo a Kawori!");
        expect(mainTitle).toBeInTheDocument();
    });

    test("renders the secondary title", () => {
        const { getByText } = render(<Welcome />);
        const secondaryTitle = getByText(
            "Kawori é uma plataforma de personalização de tela de seleção de personagens para Black Desert Online.",
        );
        expect(secondaryTitle).toBeInTheDocument();
    });

    test("applies the correct class to the container div", () => {
        const { container } = render(<Welcome />);
        const divElement = container.firstChild;
        expect(divElement).toHaveClass("intro-text");
    });
});
