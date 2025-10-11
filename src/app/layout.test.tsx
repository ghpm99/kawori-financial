import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";

jest.mock("next/navigation");

describe("RootLayout", () => {
    test("should render the layout", () => {
        render(
            <RootLayout>
                <div>Teste</div>
            </RootLayout>,
        );
        expect(screen.getByText("Teste")).toBeInTheDocument();
    });

    test("should render children elements", () => {
        render(
            <RootLayout>
                <div>Child Element</div>
            </RootLayout>,
        );
        expect(screen.getByText("Child Element")).toBeInTheDocument();
    });

    test("should render multiple children elements", () => {
        render(
            <RootLayout>
                <div>First Child</div>
                <div>Second Child</div>
            </RootLayout>,
        );
        expect(screen.getByText("First Child")).toBeInTheDocument();
        expect(screen.getByText("Second Child")).toBeInTheDocument();
    });

    test("should render without children", () => {
        render(<RootLayout />);
        expect(screen.queryByText("Teste")).not.toBeInTheDocument();
    });
});
