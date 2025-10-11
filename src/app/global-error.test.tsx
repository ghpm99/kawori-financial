import { render, screen } from "@testing-library/react";
import * as Sentry from "@sentry/nextjs";
import GlobalError from "@/app/global-error";

describe("GlobalError", () => {
    test("should render the error message", () => {
        render(<GlobalError error="error" reset={() => {}} />);
        expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
        expect(screen.getByText("Try again")).toBeInTheDocument();
        expect(Sentry.captureException).toHaveBeenCalledWith("error");
    });
});
