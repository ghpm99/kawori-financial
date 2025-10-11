import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import Page from "@/app/(landing)/news/[uid]/page";
import { createClient } from "@/prismicio"; // substitua pelo caminho correto do seu cliente

// Mock do createClient
jest.mock("@/prismicio", () => ({
    createClient: jest.fn(),
}));

const renderPageComponent = async () => {
    const ComponentResolved = await Page({ params: { uid: "uid-test" } });
    const Component = () => ComponentResolved;
    return render(<Component />);
};

describe("Page Component", () => {
    const mockClient = {
        getByUID: jest.fn(),
        getAllByType: jest.fn(),
    };

    beforeEach(() => {
        (createClient as jest.Mock).mockReturnValue(mockClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("deve renderizar o título da página corretamente", async () => {
        mockClient.getByUID.mockResolvedValue({
            data: {
                meta_title: "Test Title",
                meta_description: "Test Description",
                slices: [],
            },
            first_publication_date: "2023-01-01",
        });

        mockClient.getAllByType.mockResolvedValue([
            {
                first_publication_date: "2023-01-01",
                url: "/test-url",
                data: {
                    meta_title: "Test Title",
                },
            },
        ]);

        await renderPageComponent();

        await waitFor(() => {
            expect(screen.getAllByText("Test Title")).toHaveLength(2);
        });
    });

    test("deve renderizar a descrição da página corretamente", async () => {
        mockClient.getByUID.mockResolvedValue({
            data: {
                meta_title: "Test Title",
                meta_description: "Test Description",
                slices: [],
            },
            first_publication_date: "2023-01-01",
        });

        mockClient.getAllByType.mockResolvedValue([
            {
                first_publication_date: "2023-01-01",
                url: "/test-url",
                data: {
                    meta_title: "Test Title",
                },
            },
        ]);

        await renderPageComponent();

        await waitFor(() => {
            expect(screen.getByText("[01/01/2023] - Test Title")).toBeInTheDocument();
        });
    });
});
