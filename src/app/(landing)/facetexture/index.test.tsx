import { render } from "@testing-library/react";
import Facetexture from "@/app/(landing)/facetexture/page.tsx";

describe("Facetexture Landing Page", () => {
    test("Should be render the component", () => {
        const { container } = render(<Facetexture />);
        expect(container).toBeDefined();
    });
});
