import { render, screen } from "@testing-library/react";
import FAQ from "./index";

describe("FAQ Component", () => {
    test("renders the FAQ component with correct items", () => {
        render(<FAQ />);

        // Check if all FAQ items are rendered
        expect(screen.getByText("Como eu utilizo o site?")).toBeInTheDocument();
        expect(screen.getByText("Quanto custa para utilizar o site?")).toBeInTheDocument();
        expect(screen.getByText("Utilizar o site é seguro?")).toBeInTheDocument();
        expect(screen.getByText("Como faço para entrar em contato com o suporte?")).toBeInTheDocument();
    });
});
