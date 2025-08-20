import MenuHeader from "@/components/menuHeader/index";
import useMenuHeader from "@/components/menuHeader/useMenuHeader";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/menuHeader/useMenuHeader");

jest.mock("@/components/menuHeader/useMenuHeader");

describe("MenuHeader", () => {
    test("should render the menu header with user options when authenticated", () => {
        (useMenuHeader as jest.Mock).mockReturnValue({
            status: "authenticated",
            data: {
                user: {
                    image: "test-image",
                    name: "test-name",
                    email: "test-email",
                },
            },
        });

        render(<MenuHeader />);

        expect(screen.getByText("Inicio")).toBeInTheDocument();
        expect(screen.getByText("Black Desert")).toBeInTheDocument();
    });

    test("should render the menu header with login option when not authenticated", () => {
        (useMenuHeader as jest.Mock).mockReturnValue({
            status: "unauthenticated",
            data: null,
        });

        render(<MenuHeader />);

        expect(screen.getByText("Inicio")).toBeInTheDocument();
        expect(screen.getByText("Black Desert")).toBeInTheDocument();
    });

    describe("MenuHeader hook", () => {
        test("should render the menu header with login option when not authenticated", () => {
            (useMenuHeader as jest.Mock).mockReturnValue({
                status: "unauthenticated",
                data: null,
            });

            render(<MenuHeader />);

            expect(screen.getByText("Inicio")).toBeInTheDocument();
            expect(screen.getByText("Black Desert")).toBeInTheDocument();
            expect(screen.getByText("Logar")).toBeInTheDocument();
        });
    });
});
