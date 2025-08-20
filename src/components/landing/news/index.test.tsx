import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import News from "./index";
import { fetchProjectDetailData } from "@/app/api/lib/news";
import { formatterDate } from "@/util";

// Mock the fetchProjectDetailData function
jest.mock("@/app/api/lib/news", () => ({
    fetchProjectDetailData: jest.fn(),
}));

const mockData = [
    {
        first_publication_date: "2023-01-01",
        url: "https://example.com/news1",
        title: "News 1",
    },
    {
        first_publication_date: "2023-01-02",
        url: "https://example.com/news2",
        title: "News 2",
    },
];

describe("News Component", () => {
    beforeEach(() => {
        (fetchProjectDetailData as jest.Mock).mockResolvedValue(mockData);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders without crashing", () => {
        render(<News />);
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test("displays 'No news available' when there is no news data", async () => {
        (fetchProjectDetailData as jest.Mock).mockResolvedValueOnce([]);
        render(<News />);

        await waitFor(() => {
            expect(fetchProjectDetailData).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByText(/no news available/i)).toBeInTheDocument();
    });

    test("fetches and displays news data", async () => {
        render(<News />);

        await waitFor(() => {
            expect(fetchProjectDetailData).toHaveBeenCalledTimes(1);
        });

        mockData.forEach((news) => {
            const date = formatterDate(news.first_publication_date);
            expect(screen.getByText(`[${date}] - ${news.title}`)).toBeInTheDocument();
        });
    });
});
