import { userDetailService, userGroupsService } from ".";
import { apiDjango } from "@/services";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;

describe("userService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("userDetailService", () => {
        it("chama GET /profile/", async () => {
            const mockData = { id: 1, username: "test" };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await userDetailService();

            expect(mockedGet).toHaveBeenCalledWith("profile/");
            expect(result).toEqual({ data: mockData });
        });
    });

    describe("userGroupsService", () => {
        it("chama GET /profile/groups/", async () => {
            const mockData = { data: ["admin", "user"] };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await userGroupsService();

            expect(mockedGet).toHaveBeenCalledWith("profile/groups/");
            expect(result).toEqual({ data: mockData });
        });
    });
});
