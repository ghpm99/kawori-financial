import {
    sendCommandService,
    screenSizeService,
    hotkeyService,
    mouseMoveService,
    keyPressService,
    mouseButtonService,
    mouseScrollService,
    mouseMoveButtonService,
} from "./index";
import { apiDjango } from "..";

jest.mock("..", () => ({
    apiDjango: {
        post: jest.fn(),
        get: jest.fn(),
    },
}));

describe("Remote Services", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should send a command", async () => {
        const mockResponse = { data: "command sent" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await sendCommandService("test-command");
        expect(apiDjango.post).toHaveBeenCalledWith("remote/send-command", { cmd: "test-command" });
        expect(response).toBe("command sent");
    });

    test("should get screen size", async () => {
        const mockResponse = { data: { width: 1920, height: 1080 } };
        (apiDjango.get as jest.Mock).mockResolvedValue(mockResponse);

        const response = await screenSizeService();
        expect(apiDjango.get).toHaveBeenCalledWith("remote/screen-size");
        expect(response).toEqual({ width: 1920, height: 1080 });
    });

    test("should send a hotkey", async () => {
        const mockResponse = { data: "hotkey sent" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await hotkeyService("ctrl+c");
        expect(apiDjango.post).toHaveBeenCalledWith("remote/hotkey", { hotkey: "ctrl+c" });
        expect(response).toBe("hotkey sent");
    });

    test("should move the mouse", async () => {
        const mockResponse = { data: "mouse moved" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await mouseMoveService(100, 200);
        expect(apiDjango.post).toHaveBeenCalledWith("remote/mouse-move", { x: 100, y: 200 });
        expect(response).toBe("mouse moved");
    });

    test("should press keys", async () => {
        const mockResponse = { data: "keys pressed" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await keyPressService("abc");
        expect(apiDjango.post).toHaveBeenCalledWith("remote/key-press", { keys: "abc" });
        expect(response).toBe("keys pressed");
    });

    test("should press a mouse button", async () => {
        const mockResponse = { data: "button pressed" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await mouseButtonService("left");
        expect(apiDjango.post).toHaveBeenCalledWith("remote/mouse-button", { button: "left" });
        expect(response).toBe("button pressed");
    });

    test("should scroll the mouse", async () => {
        const mockResponse = { data: "mouse scrolled" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await mouseScrollService(10);
        expect(apiDjango.post).toHaveBeenCalledWith("remote/mouse-scroll", { value: 10 });
        expect(response).toBe("mouse scrolled");
    });

    test("should move the mouse and press a button", async () => {
        const mockResponse = { data: "mouse moved and button pressed" };
        (apiDjango.post as jest.Mock).mockResolvedValue(mockResponse);

        const response = await mouseMoveButtonService(100, 200, "right");
        expect(apiDjango.post).toHaveBeenCalledWith("remote/mouse-move-and-button", {
            x: 100,
            y: 200,
            button: "right",
        });
        expect(response).toBe("mouse moved and button pressed");
    });
});
