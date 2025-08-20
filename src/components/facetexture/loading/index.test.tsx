import { renderWithProviders } from "@/util/test-utils";
import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import Loading from "@/components/facetexture/loading";

describe("Test Characters container", () => {
    test("Check render", () => {
        const { container } = renderWithProviders(<Loading />);
        expect(container).toBeInTheDocument();

        expect(screen.getByText("Kawori")).toBeInTheDocument();
        expect(screen.getByText("Facetexture")).toBeInTheDocument();
        expect(screen.getByText("Personagens")).toBeInTheDocument();
        expect(screen.getByText("Background")).toBeInTheDocument();
        expect(screen.getByText("Preview")).toBeInTheDocument();
    });
});
