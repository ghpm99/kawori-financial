"use client";
import { title } from "process";

import { useEffect } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { faEllipsis, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Breadcrumb, Button, Dropdown, Layout, MenuProps, message, Space, Table, Tag, Typography } from "antd";
import { useSelector } from "react-redux";

import { setSelectedMenu } from "@/lib/features/auth";
import { changeVisibleModalTag, fetchTags } from "@/lib/features/financial/tag";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { includeNewTagService } from "@/services/financial";
import { formatMoney } from "@/util";

import LoadingPage from "@/components/loadingPage/Index";
import { useTags } from "@/components/providers/tags";
import ModalNewTag, { IFormModalNewTag } from "@/components/tags/modalNew";
import TagDrawer from "@/components/tags/tagDrawer";

import styles from "./tags.module.scss";



const { Title } = Typography;

function TagPage() {
    const financialStore = useSelector((state: RootState) => state.financial.tag);
    const dispatch = useAppDispatch();

    const {
        handleOnOpenDrawer,
        handleOnCloseDrawer,
        openDrawer,
        isLoadingTagDetails,
        data,
        loading,
        tagDetails,
        onUpdateTagDetail,
    } = useTags();

    const openModal = (modal: keyof IModalTags) => {
        dispatch(changeVisibleModalTag({ modal, visible: true }));
    };

    const closeModal = (modal: keyof IModalTags) => {
        dispatch(changeVisibleModalTag({ modal, visible: false }));
    };

    const onFinish = (values: IFormModalNewTag) => {
        const newTag = {
            name: values.name,
            color: values.color,
        };

        includeNewTagService(newTag).then((e) => {
            message.success(e.msg);
            closeModal("newTag");
            dispatch(fetchTags());
        });
    };

    const createDropdownMenu = (record: PaymentItem): MenuProps => {
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
            },
        ];

        return { items };
    };

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Em aberto</Breadcrumb.Item>
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
                            render: (_: any, tag: ITags) => <Tag color={tag.color}>{tag.name}</Tag>,
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
                            render: (value: any) => formatMoney(value),
                        },
                        {
                            title: "Total em aberto",
                            dataIndex: "total_open",
                            key: "total_open",
                            render: (value: any) => formatMoney(value),
                        },
                        {
                            title: "Total baixado",
                            dataIndex: "total_closed",
                            key: "total_closed",
                            render: (value: any) => formatMoney(value),
                        },
                        {
                            title: "Ações",
                            dataIndex: "id",
                            key: "id",
                            render: (value: any, record: any) => (
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
