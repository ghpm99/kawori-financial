import React from "react";
import { render } from "@testing-library/react";

import PaymentFixed from "./index";

describe("PaymentFixed Component", () => {
    test("renders the chart with correct data", () => {
        const { container } = render(<PaymentFixed fixedCredit={300} fixedDebit={150} />);
        const canvas = container.querySelector("canvas");
        expect(canvas).toBeInTheDocument();
    });
});
