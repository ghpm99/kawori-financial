import { INewsData, IStatusNews } from "@/lib/features/news";

import styles from "./news.module.scss";
import NewsList from "./newsList";

const News = ({ data, status }: { data: INewsData[]; status: IStatusNews }) => {
    if (status === "loading") return <p>Loading...</p>;

    const hasNewsFeed = data.length > 0;

    return (
        <div className={styles["news-list"]}>
            {!hasNewsFeed && <p>No news available</p>}
            {hasNewsFeed && <NewsList data={data} />}
        </div>
    );
};

export default News;
