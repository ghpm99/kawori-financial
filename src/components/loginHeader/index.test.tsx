import { renderWithProviders } from "@/util/test-utils";
import LoginHeader from "@/components/loginHeader/Index";

describe("Test Characters container", () => {
    test("Check render", () => {
        const { baseElement, getByRole } = renderWithProviders(<LoginHeader />);
        expect(baseElement).toBeInTheDocument();
        expect(getByRole("img")).toBeInTheDocument();
    });
});
