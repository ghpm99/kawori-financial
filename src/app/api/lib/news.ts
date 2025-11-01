import { cache } from "react";

import { INewsData } from "@/lib/features/news";
import { createClient } from "@/prismicio";

export const fetchNewsFeedData = cache(async () => {
    const client = createClient();

    const page = await client.getAllByType("platform_news");

    const pageList: INewsData[] = page.map((item) => ({
        first_publication_date: item.first_publication_date,
        url: item.url ?? "/",
        title: item.data.meta_title,
    }));

    return pageList;
});
