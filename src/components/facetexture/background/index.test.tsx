import { renderWithProviders } from "@/util/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import Background from "./index";

describe("Background Component", () => {
    test("renders Background component", () => {
        renderWithProviders(<Background />);

        expect(screen.getByText("Background")).toBeInTheDocument();
        expect(screen.getByAltText("background")).toHaveAttribute("src", "");
        expect(screen.getByText(/clique ou arraste o arquivo para esta área para fazer upload/i)).toBeInTheDocument();
    });

    test.skip("uploads new background", async () => {
        renderWithProviders(<Background />);

        const file = new File(["dummy content"], "example.png", { type: "image/png" });
        const input = screen.getByLabelText(/clique ou arraste o arquivo para esta área para fazer upload/i);

        Object.defineProperty(input, "files", {
            value: [file],
        });

        fireEvent.change(input);

        // Add assertions to check if the file upload logic works as expected
        // For example, you can mock the db.background.update and dispatch functions
    });
});
