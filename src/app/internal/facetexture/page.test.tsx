import { fetchFacetexture } from "@/lib/features/facetexture";
import { db } from "@/util/db";
import { renderWithProviders } from "@/util/test-utils";
import { screen, waitFor } from "@testing-library/react";
import FaceTexture from "./page";

jest.mock("@/lib/features/facetexture", () => ({
    fetchFacetexture: jest.fn(),
}));

jest.mock("@/util/db", () => ({
    db: {
        background: {
            toArray: jest.fn(),
            add: jest.fn(),
        },
        image: {
            where: jest.fn().mockReturnThis(),
            equals: jest.fn().mockReturnThis(),
            first: jest.fn(),
        },
    },
}));

describe.skip("FaceTexture", () => {
    it("should render loading component when loading", () => {
        renderWithProviders(<FaceTexture />);

        expect(screen.getByText("Carregando")).toBeInTheDocument();
    });

    it("should render the FaceTexture component", async () => {
        renderWithProviders(<FaceTexture />);

        expect(screen.getByText("Perdido? Precisa de ajuda?")).toBeInTheDocument();
        expect(screen.getByText("guia em video")).toBeInTheDocument();
        expect(screen.getByText("nosso discord.")).toBeInTheDocument();
    });

    it("should dispatch fetchFacetexture on mount", async () => {
        renderWithProviders(<FaceTexture />);

        await waitFor(() => {
            expect(fetchFacetexture).toHaveBeenCalled();
        });
    });

    it("should update document title on mount", () => {
        renderWithProviders(<FaceTexture />);

        expect(document.title).toBe("Kawori Facetexture");
    });

    it("should update background image", async () => {
        const mockBackground = { image: new Blob() };
        db.background.toArray.mockResolvedValueOnce([mockBackground]);

        renderWithProviders(<FaceTexture />);

        await waitFor(() => {
            expect(db.background.toArray).toHaveBeenCalled();
        });
    });

    it("should update character image", async () => {
        const mockImage = { imagem: new Blob() };
        db.image.first.mockResolvedValueOnce(mockImage);

        renderWithProviders(<FaceTexture />);

        await waitFor(() => {
            expect(db.image.where).toHaveBeenCalled();
        });
    });
});
