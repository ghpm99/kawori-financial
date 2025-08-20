import { downloadFacetextureService, previewFacetextureService } from "@/services/facetexture";
import { renderWithProviders } from "@/util/test-utils";
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import Preview from "./index";

jest.mock("@/util/db");
jest.mock("@/services/facetexture");
jest.mock("@sentry/nextjs");

describe("Preview Component", () => {
    test("renders the Preview component", () => {
        renderWithProviders(<Preview />);

        expect(screen.getByText("Preview")).toBeInTheDocument();
        expect(screen.getByText("Atualizar")).toBeInTheDocument();
        expect(screen.getByText("Baixar")).toBeInTheDocument();
    });

    test.skip('updates preview background on "Atualizar" button click', async () => {
        (previewFacetextureService as jest.Mock).mockResolvedValue(new Blob());

        renderWithProviders(<Preview />);

        const updateButton = screen.getByText("Atualizar");
        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(previewFacetextureService).toHaveBeenCalledWith({ background: "test-image" });
            expect(screen.getByAltText("preview-background")).toBeInTheDocument();
        });
    });

    test.skip('downloads facetexture on "Baixar" button click', async () => {
        (downloadFacetextureService as jest.Mock).mockResolvedValue(new Blob());

        renderWithProviders(<Preview />);

        const downloadButton = screen.getByText("Baixar");
        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(downloadFacetextureService).toHaveBeenCalledWith({ background: "test-image" });
        });
    });

    test.skip("disables buttons when facetextureStore is empty", () => {
        renderWithProviders(<Preview />);

        const updateButton = screen.getByText("Atualizar");
        const downloadButton = screen.getByText("Baixar");

        expect(updateButton).toBeDisabled();
        expect(downloadButton).toBeDisabled();
    });
});
