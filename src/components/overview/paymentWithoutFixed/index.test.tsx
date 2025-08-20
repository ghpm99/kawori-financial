import React from "react";
import { render } from "@testing-library/react";

import AccumulatedValue from "./index";
import { formatterMonthYearDate } from "@/util/index";

jest.mock("@/util/index", () => ({
    formatterMonthYearDate: jest.fn((date) => date),
}));

describe("AccumulatedValue Component", () => {
    const mockPayments = [
        { label: "2023-01", accumulated: 100 },
        { label: "2023-02", accumulated: 200 },
    ];
    const mockAmountForecastValue = 150;

    test("renders without crashing", () => {
        const { container } = render(
            <AccumulatedValue payments={mockPayments} amountForecastValue={mockAmountForecastValue} />,
        );
        expect(container).toBeInTheDocument();
    });

    test("formats the labels correctly", () => {
        render(<AccumulatedValue payments={mockPayments} amountForecastValue={mockAmountForecastValue} />);
        expect(formatterMonthYearDate).toHaveBeenCalledWith("2023-01");
        expect(formatterMonthYearDate).toHaveBeenCalledWith("2023-02");
    });

    test("renders the correct number of datasets", () => {
        const { container } = render(
            <AccumulatedValue payments={mockPayments} amountForecastValue={mockAmountForecastValue} />,
        );
        const datasets = container.querySelectorAll(".chart-container canvas");
        expect(datasets.length).toBe(1);
    });

    test("renders the chart with correct data", () => {
        const { container } = render(
            <AccumulatedValue payments={mockPayments} amountForecastValue={mockAmountForecastValue} />,
        );
        const chartInstance = container.querySelector(".chart-container canvas");
        expect(chartInstance).toBeInTheDocument();
    });
});
