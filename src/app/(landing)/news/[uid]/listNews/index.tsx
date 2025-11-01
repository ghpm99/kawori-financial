"use client";
import { List } from "antd";
import Link from "next/link";

import { formatterDate } from "@/util";

const ListNews = ({ items }: { items: any[] }) => {
    return (
        <List
            style={{
                height: "100%",
            }}
            header={<strong>Recentes</strong>}
            bordered
            dataSource={items}
            renderItem={(item) => (
                <List.Item>
                    <Link href={item.url ?? ""}>
                        [{formatterDate(item.first_publication_date)}]{" - "}
                        {item.title}
                    </Link>
                </List.Item>
            )}
        />
    );
};

export default ListNews;
