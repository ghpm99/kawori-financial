import { render } from "@testing-library/react";
import { useRouter } from "next/navigation";
import Facetexture from "./page";

jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

describe("Facetexture Component", () => {
    test("should navigate to /internal/facetexture on render", () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

        render(<Facetexture />);

        expect(pushMock).toHaveBeenCalledWith("/internal/facetexture");
    });
});
