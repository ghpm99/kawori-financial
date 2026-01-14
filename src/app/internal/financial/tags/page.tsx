"use client";

import { PlusOutlined } from "@ant-design/icons";
import { faEllipsis, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Breadcrumb, Button, Dropdown, Layout, MenuProps, Space, Table, Tag, Typography } from "antd";

import { formatMoney } from "@/util";

import LoadingPage from "@/components/loadingPage/Index";
import { ITags, useTags } from "@/components/providers/tags";
import TagDrawer from "@/components/tags/tagDrawer";

import styles from "./tags.module.scss";

const { Title } = Typography;

function TagPage() {
    const {
        handleOnOpenDrawer,
        handleOnCloseDrawer,
        openDrawer,
        isLoadingTagDetails,
        data,
        loading,
        tagDetails,
        onUpdateTagDetail,
        onCreateNewTag,
    } = useTags();

    const createDropdownMenu = (record: ITags): MenuProps => {
        const items: MenuProps["items"] = [
            {
                key: "1",
                label: "Ações",
                disabled: true,
            },
            {
                type: "divider",
            },
            {
                key: "2",
                icon: <FontAwesomeIcon icon={faFilePen} />,
                label: "Editar",
                onClick: () => handleOnOpenDrawer(record.id),
                disabled: record.is_budget,
            },
        ];

        return { items };
    };

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Etiquetas</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Etiquetas
                    </Title>
                    <div>
                        <Button icon={<PlusOutlined />} onClick={() => handleOnOpenDrawer()}>
                            Novo
                        </Button>
                    </div>
                </div>
                <Table
                    pagination={{
                        showSizeChanger: true,
                        defaultPageSize: 20,
                    }}
                    columns={[
                        {
                            title: "Nome",
                            dataIndex: "name",
                            key: "name",
                            render: (_: string, tag: ITags) => <Tag color={tag.color}>{tag.name}</Tag>,
                        },
                        {
                            title: "Quantidade de pagamentos",
                            dataIndex: "total_payments",
                            key: "total_payments",
                        },
                        {
                            title: "Total de valor",
                            dataIndex: "total_value",
                            key: "total_value",
                            render: (value: number) => formatMoney(value),
                        },
                        {
                            title: "Total em aberto",
                            dataIndex: "total_open",
                            key: "total_open",
                            render: (value: number) => formatMoney(value),
                        },
                        {
                            title: "Total baixado",
                            dataIndex: "total_closed",
                            key: "total_closed",
                            render: (value: number) => formatMoney(value),
                        },
                        {
                            title: "Ações",
                            dataIndex: "id",
                            key: "id",
                            render: (value: number, record: ITags) => (
                                <Dropdown menu={createDropdownMenu(record)}>
                                    <a onClick={(e) => e.preventDefault()}>
                                        <Space>
                                            <FontAwesomeIcon icon={faEllipsis} />
                                        </Space>
                                    </a>
                                </Dropdown>
                            ),
                        },
                    ]}
                    dataSource={data}
                    loading={loading}
                />
                <TagDrawer
                    open={openDrawer}
                    onClose={handleOnCloseDrawer}
                    isLoading={isLoadingTagDetails}
                    tagDetails={tagDetails}
                    onUpdateTagDetail={onUpdateTagDetail}
                    onCreateNewTag={onCreateNewTag}
                />
            </Layout>
        </>
    );
}

TagPage.auth = {
    role: "admin",
    loading: <LoadingPage />,
    unauthorized: "/signin",
};

export default TagPage;
