import {
    fetchFacetextureService,
    fetchFaceTextureClassService,
    previewFacetextureService,
    downloadFacetextureService,
    newCharacterThunk,
    reorderCharacterThunk,
    changeClassCharacterThunk,
    changeCharacterNameThunk,
    changeShowClassThunk,
    deleteCharacterThunk,
} from "./index";
import { apiDjango } from "..";

jest.mock("..", () => ({
    apiDjango: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

describe("Facetexture Service", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("fetchFacetextureService should fetch facetexture data", async () => {
        const mockData = { characters: [] };
        (apiDjango.get as jest.Mock).mockResolvedValue({ data: mockData });

        const result = await fetchFacetextureService();
        expect(apiDjango.get).toHaveBeenCalledWith("/facetexture/");
        expect(result).toEqual(mockData);
    });

    test("fetchFaceTextureClassService should fetch facetexture class data", async () => {
        const mockData = {};
        (apiDjango.get as jest.Mock).mockResolvedValue({ data: mockData });

        const result = await fetchFaceTextureClassService();
        expect(apiDjango.get).toHaveBeenCalledWith("/facetexture/class");
        expect(result).toEqual(mockData);
    });

    test("previewFacetextureService should preview facetexture", async () => {
        const mockData = new Blob();
        const args = { some: "data" };
        (apiDjango.post as jest.Mock).mockResolvedValue({ data: mockData });

        const result = await previewFacetextureService(args);
        expect(apiDjango.post).toHaveBeenCalledWith("/facetexture/preview", args, {
            responseType: "blob",
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        expect(result).toEqual(mockData);
    });

    test("downloadFacetextureService should download facetexture", async () => {
        const mockData = new Blob();
        const args = { some: "data" };
        (apiDjango.post as jest.Mock).mockResolvedValue({ data: mockData });

        const result = await downloadFacetextureService(args);
        expect(apiDjango.post).toHaveBeenCalledWith("/facetexture/download", args, {
            responseType: "blob",
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        expect(result).toEqual(mockData);
    });
});
