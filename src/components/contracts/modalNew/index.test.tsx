import React from "react";

import { renderWithProviders } from "@/util/test-utils";

import ModalNew from "@/components/contracts/modalNew";

const defaultProps = {
    visible: true,
    onCancel: jest.fn(),
    onFinish: jest.fn(),
};

describe("ModalNew component", () => {
    test("Should be render the component", () => {
        const applyFilterMock = jest.fn();

        const { container } = renderWithProviders(<ModalNew {...defaultProps} />);

        expect(container).toBeDefined();
    });
});
