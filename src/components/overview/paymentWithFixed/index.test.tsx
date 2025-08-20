import React from "react";
import { render } from "@testing-library/react";
import PaymentWithFixed from "./index";

describe("PaymentWithFixed Component", () => {
    const mockData: IPaymentCharts[] = [
        { label: "2023-01", credit: 100, debit: 50, difference: 50, accumulated: 100, total: 100 },
        { label: "2023-02", credit: 200, debit: 100, difference: 100, accumulated: 200, total: 200 },
        { label: "2023-03", credit: 300, debit: 150, difference: 150, accumulated: 300, total: 300 },
    ];

    test("should render without crashing", () => {
        const { container } = render(<PaymentWithFixed data={mockData} />);
        expect(container).toBeInTheDocument();
    });

    test("should have the correct number of datasets", () => {
        const { container } = render(<PaymentWithFixed data={mockData} />);
        const datasets = container.querySelectorAll(".chart-container canvas");
        expect(datasets.length).toBe(1); // Since we are rendering a single Line chart
    });
});
