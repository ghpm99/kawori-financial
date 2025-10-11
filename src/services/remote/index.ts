import { apiDjango } from "..";

export async function sendCommandService(command: string) {
    const response = await apiDjango.post("remote/send-command", {
        cmd: command,
    });
    return response.data;
}

export async function screenSizeService() {
    const response = await apiDjango.get("remote/screen-size");
    return response.data;
}

export async function hotkeyService(hotkey: string) {
    const response = await apiDjango.post("remote/hotkey", { hotkey: hotkey });
    return response.data;
}

export async function mouseMoveService(x: number, y: number) {
    const response = await apiDjango.post("remote/mouse-move", { x: x, y: y });
    return response.data;
}

export async function keyPressService(keys: string) {
    const response = await apiDjango.post("remote/key-press", { keys: keys });
    return response.data;
}

export async function mouseButtonService(button: string) {
    const response = await apiDjango.post("remote/mouse-button", {
        button: button,
    });
    return response.data;
}

export async function mouseScrollService(value: number) {
    const response = await apiDjango.post("remote/mouse-scroll", {
        value: value,
    });
    return response.data;
}

export async function mouseMoveButtonService(x: number, y: number, button: string) {
    const response = await apiDjango.post("remote/mouse-move-and-button", {
        x: x,
        y: y,
        button: button,
    });
    return response.data;
}
