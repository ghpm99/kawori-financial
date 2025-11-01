import { List } from "antd";
import Link from "next/link";

import { INewsData } from "@/lib/features/news";
import { formatterDate } from "@/util";

const NewsList = ({ data }: { data: INewsData[] }) => {
    return (
        <List
            header={<strong>Novidades</strong>}
            bordered
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <Link href={item.url}>
                        [{formatterDate(item.first_publication_date)}]{" - "}
                        {item.title}
                    </Link>
                </List.Item>
            )}
        />
    );
};

export default NewsList;
