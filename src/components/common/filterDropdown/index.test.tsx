import React from "react";

import { renderWithProviders } from "@/util/test-utils";

import FilterDropdown from "@/components/common/filterDropdown/Index";

describe("FilterDropdown component", () => {
    test("Should be render the component", () => {
        const applyFilterMock = jest.fn();

        const { container } = renderWithProviders(
            <FilterDropdown applyFilter={applyFilterMock}>
                <div>test</div>
            </FilterDropdown>,
        );

        expect(container).toBeDefined();
    });
});
