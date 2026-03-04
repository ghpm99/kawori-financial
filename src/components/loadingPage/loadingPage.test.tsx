import { render, screen } from "@testing-library/react";

import LoadingPage from "./Index";

describe("LoadingPage", () => {
    test("renderiza texto de carregamento", () => {
        render(<LoadingPage />);
        expect(screen.getByText("Carregando...")).toBeInTheDocument();
    });
});
