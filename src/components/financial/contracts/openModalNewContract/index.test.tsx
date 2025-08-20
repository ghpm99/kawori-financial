import { fireEvent, screen, waitFor } from "@testing-library/react";
import OpenModalNewContract from "@/components/financial/contracts/openModalNewContract";
import { renderWithProviders } from "@/util/test-utils";
import "@testing-library/jest-dom";
import { store } from "@/lib/store";

describe("Open Modal New Contract", () => {
    test("Render button new modal", () => {
        const { baseElement } = renderWithProviders(<OpenModalNewContract />);
        expect(baseElement).toBeInTheDocument();
    });
});
