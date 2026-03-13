import { userDetailService, userGroupsService, getEmailPreferencesService, updateEmailPreferencesService } from ".";
import { apiDjango } from "@/services";

jest.mock("@/services", () => ({
    apiDjango: {
        get: jest.fn(),
        put: jest.fn(),
    },
}));

const mockedGet = apiDjango.get as jest.Mock;
const mockedPut = apiDjango.put as jest.Mock;

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

    describe("getEmailPreferencesService", () => {
        it("chama GET /mailer/preferences/", async () => {
            const mockData = { allow_all_emails: true, allow_notification: true, allow_promotional: true };
            mockedGet.mockResolvedValueOnce({ data: mockData });

            const result = await getEmailPreferencesService();

            expect(mockedGet).toHaveBeenCalledWith("mailer/preferences/");
            expect(result).toEqual({ data: mockData });
        });
    });

    describe("updateEmailPreferencesService", () => {
        it("chama PUT /mailer/preferences/ com dados parciais", async () => {
            const payload = { allow_all_emails: false };
            const mockResponse = { allow_all_emails: false, allow_notification: true, allow_promotional: true };
            mockedPut.mockResolvedValueOnce({ data: mockResponse });

            const result = await updateEmailPreferencesService(payload);

            expect(mockedPut).toHaveBeenCalledWith("mailer/preferences/", payload);
            expect(result).toEqual({ data: mockResponse });
        });
    });
});
