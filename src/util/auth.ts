import { Buffer } from "buffer";

export function createBasicAuth(username: string, password: string) {
    return Buffer.from(`${username}:${password}`).toString("base64");
}
