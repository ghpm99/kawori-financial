import React from "react";
import { render } from "@testing-library/react";
import PusherProvider from "./Index";
import Pusher from "pusher-js";
import { setPusherClient } from "react-pusher";

jest.mock("pusher-js");
jest.mock("react-pusher", () => ({
    setPusherClient: jest.fn(),
}));

describe("PusherProvider", () => {
    const pusherKey = "test-key";
    const pusherCluster = "test-cluster";
    const mockChild = (
        <div pusher_key={pusherKey} pusher_cluster={pusherCluster}>
            Test Child
        </div>
    );

    beforeEach(() => {
        (Pusher as jest.Mock).mockClear();
        (setPusherClient as jest.Mock).mockClear();
    });

    test("should initialize Pusher with correct parameters", () => {
        render(<PusherProvider>{mockChild}</PusherProvider>);

        expect(Pusher).toHaveBeenCalledWith(pusherKey, {
            cluster: pusherCluster,
            authEndpoint: process.env.NEXT_PUBLIC_API_URL + "/admin-api/pusher/auth",
            auth: { headers: { Authorization: `Basic ` } },
        });
    });

    test("should set Pusher client", () => {
        render(<PusherProvider>{mockChild}</PusherProvider>);

        expect(setPusherClient).toHaveBeenCalled();
    });

    test("should render children", () => {
        const { getByText } = render(<PusherProvider>{mockChild}</PusherProvider>);

        expect(getByText("Test Child")).toBeInTheDocument();
    });
});
