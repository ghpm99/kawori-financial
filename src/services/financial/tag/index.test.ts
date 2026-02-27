import { fetchDetailTagService, fetchTagsService, includeNewTagService, saveTagService } from ".";
import { apiDjango } from "@/services";
import { ITags } from "@/components/providers/tags";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
        post: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;
const mockedPost = apiDjango.post as jest.Mock;

const mockTag: ITags = {
    id: 1,
    name: "Alimentação",
    color: "#ff0000",
    total_payments: 5,
    total_value: 500,
    total_open: 2,
    total_closed: 3,
    is_budget: false,
};

describe("tagService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("fetchTagsService", () => {
        it("chama GET /financial/tag/ e retorna data", async () => {
            const mockResponse = { data: [mockTag] };
            mockedGet.mockResolvedValueOnce({ data: mockResponse });

            const result = await fetchTagsService();

            expect(mockedGet).toHaveBeenCalledWith("/financial/tag/");
            expect(result).toEqual(mockResponse);
        });
    });

    describe("fetchDetailTagService", () => {
        it("chama GET /financial/tag/:id/ e retorna data", async () => {
            const mockResponse = { data: mockTag };
            mockedGet.mockResolvedValueOnce({ data: mockResponse });

            const result = await fetchDetailTagService(1);

            expect(mockedGet).toHaveBeenCalledWith("/financial/tag/1/");
            expect(result).toEqual(mockResponse);
        });
    });

    describe("saveTagService", () => {
        it("chama POST /financial/tag/:id/save e retorna response", async () => {
            const mockResponse = { data: { msg: "Tag salva" } };
            mockedPost.mockResolvedValueOnce(mockResponse);

            const result = await saveTagService(mockTag);

            expect(mockedPost).toHaveBeenCalledWith("/financial/tag/1/save", mockTag);
            expect(result).toEqual(mockResponse);
        });
    });

    describe("includeNewTagService", () => {
        it("chama POST /financial/tag/new e retorna data", async () => {
            const newTag = { name: "Nova Tag", color: "#00ff00" };
            const mockData = { msg: "Tag criada" };
            mockedPost.mockResolvedValueOnce({ data: mockData });

            const result = await includeNewTagService(newTag);

            expect(mockedPost).toHaveBeenCalledWith("/financial/tag/new", newTag);
            expect(result).toEqual(mockData);
        });
    });
});
