"use client";

import { useEffect, useState } from "react";

import { ClearOutlined, FileAddOutlined, SearchOutlined, ToTopOutlined } from "@ant-design/icons";
import { faEllipsis, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Breadcrumb, Button, Dropdown, Input, Layout, MenuProps, Space, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { formatMoney, formatterDate, updateSearchParams } from "@/util/index";

import FilterDropdown from "@/components/common/filterDropdown/Index";
import InvoiceDrawer from "@/components/invoices/invoiceDrawer";
import { Payments } from "@/components/invoices/payments";
import LoadingPage from "@/components/loadingPage/Index";
import ModalPayoff from "@/components/payments/modalPayoff";
import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import { useInvoices } from "@/components/providers/invoices";
import { usePayments } from "@/components/providers/payments";
import { PayoffPayment, usePayoff } from "@/components/providers/payments/payoff";
import { useTags } from "@/components/providers/tags";

import styles from "./Invoices.module.scss";

const { Title } = Typography;

function FinancialPage({ searchParams }) {
    const router = useRouter();
    const pathname = usePathname();

    const { data: tags, loading: isLoadingTags } = useTags();
    const {
        invoicesData,
        isLoading,
        onChangePagination,
        invoiceFilters,
        handleChangeFilter,
        cleanFilter,
        onOpenInvoiceDetail,
        invoiceDetailVisible,
        onCloseInvoiceDetail,
        invoiceDetail,
        isLoadingInvoiceDetail,
        onUpdateInvoiceDetail,
    } = useInvoices();

    const {
        selectedRow,
        updateSelectedRows,
        onClosePaymentDetail,
        paymentDetailVisible,
        paymentDetail,
        isLoadingPaymentDetail,
        onUpdatePaymentDetail,
    } = usePayments();

    const {
        modalBatchVisible,
        openPayoffBatchModal,
        closePayoffBatchModal,
        paymentsToProcess,
        paymentPayoffBatchProgress,
        paymentPayoffBatchProgressText,
        setPaymentsToProcess,
        clearPaymentsToProcess,
        processPayOffBatch,
        payOffPayment,
        processPayOffBatchCompleted,
        processingBatch,
    } = usePayoff();

    useEffect(() => {
        updateSearchParams(router, pathname, invoiceFilters);
    }, [invoiceFilters, router, pathname]);

    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);

    const openPayoffModal = () => {
        openPayoffBatchModal();
        const dataSource: PayoffPayment[] = selectedRow.map((id) => ({
            id: parseInt(id.toString()),
            description: "Aguardando",
            status: "pending",
        }));
        setPaymentsToProcess(dataSource);
    };

    const createDropdownMenu = (record: IInvoicePagination): MenuProps => {
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
                onClick: () => onOpenInvoiceDetail(record.id),
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
                        Valores em aberto
                    </Title>
                    <div>
                        <Button
                            icon={<FileAddOutlined />}
                            type="primary"
                            onClick={() => onOpenInvoiceDetail(undefined)}
                        >
                            Adicionar nota
                        </Button>
                        <Button
                            icon={<ToTopOutlined />}
                            onClick={openPayoffModal}
                            disabled={selectedRow.filter((item) => item.selected).length === 0}
                        >
                            Baixar pagamentos
                        </Button>
                        <Button icon={<ClearOutlined />} onClick={cleanFilter}>
                            Limpar filtros
                        </Button>
                    </div>
                </div>
                <Table
                    scroll={{ x: "max-content" }}
                    rowKey={"id"}
                    pagination={{
                        showSizeChanger: true,
                        pageSize: invoicesData.page_size,
                        current: invoicesData.current_page,
                        total: invoicesData.total_pages * invoicesData.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={[
                        {
                            title: "Nome",
                            dataIndex: "name",
                            key: "name",
                            filterDropdown: () => (
                                <FilterDropdown applyFilter={() => {}}>
                                    <Input
                                        name="name__icontains"
                                        style={{ width: 220 }}
                                        onChange={(event) => handleChangeFilter(event)}
                                        value={invoiceFilters?.name__icontains ?? ""}
                                    />
                                </FilterDropdown>
                            ),
                            filterIcon: (filtered: boolean) => (
                                <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                            ),
                        },
                        {
                            title: "Valor",
                            dataIndex: "value",
                            key: "value",
                            render: (value) => formatMoney(value),
                        },
                        {
                            title: "Baixado",
                            dataIndex: "value_closed",
                            key: "value_closed",
                            render: (value) => formatMoney(value),
                        },
                        {
                            title: "Em aberto",
                            dataIndex: "value_open",
                            key: "value_open",
                            render: (value) => formatMoney(value),
                        },
                        {
                            title: "Parcelas",
                            dataIndex: "installments",
                            key: "installments",
                        },
                        {
                            title: "Proximo pagamento",
                            dataIndex: "next_payment",
                            key: "next_payment",
                            render: (value) => formatterDate(value),
                        },
                        {
                            title: "Tags",
                            dataIndex: "tags",
                            key: "tags",
                            render: (_, { tags }: IInvoicePagination) =>
                                tags.map((tag) => (
                                    <Tag color={tag.color} key={`invoice-tags-${tag.id}`}>
                                        {tag.name}
                                    </Tag>
                                )),
                        },
                        {
                            title: "Ações",
                            dataIndex: "id",
                            key: "id",
                            render: (_, record) => (
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
                    dataSource={invoicesData.data}
                    loading={isLoading}
                    summary={(invoiceData) => <TableSummary invoiceData={invoiceData} />}
                    expandable={{
                        expandedRowKeys,
                        expandedRowRender: (record) => (
                            <Payments
                                invoice={record}
                                payOffPayment={payOffPayment}
                                updateSelectedRows={updateSelectedRows}
                                selectedRow={selectedRow}
                            />
                        ),
                        rowExpandable: (record) => {
                            return record?.installments > 0;
                        },
                        onExpand: (expanded, record) => {
                            if (expanded) {
                                setExpandedRowKeys([record.id]);
                            } else {
                                setExpandedRowKeys([]);
                            }
                        },
                    }}
                />
            </Layout>
            <ModalPayoff
                visible={modalBatchVisible}
                onCancel={closePayoffBatchModal}
                onPayoff={processPayOffBatch}
                data={paymentsToProcess}
                percent={paymentPayoffBatchProgress}
                progressText={paymentPayoffBatchProgressText()}
                completed={processPayOffBatchCompleted}
                processing={processingBatch}
            />
            <PaymentsDrawer
                onClose={onClosePaymentDetail}
                open={paymentDetailVisible}
                paymentDetail={paymentDetail}
                isLoading={isLoadingPaymentDetail}
                onUpdatePaymentDetail={onUpdatePaymentDetail}
            />
            <InvoiceDrawer
                open={invoiceDetailVisible}
                onClose={onCloseInvoiceDetail}
                invoiceDetail={invoiceDetail}
                isLoading={isLoadingInvoiceDetail}
                onUpdateInvoiceDetail={onUpdateInvoiceDetail}
                tags_data={tags}
                isLoadingTags={isLoadingTags}
            />
        </>
    );
}

function TableSummary({ invoiceData }: { invoiceData: readonly IInvoicePagination[] }) {
    const { Text } = Typography;

    let total = 0;
    let totalOpen = 0;
    let totalClosed = 0;
    invoiceData.forEach((invoice) => {
        total = total + invoice.value;
        totalOpen = totalOpen + invoice.value_open;
        totalClosed = totalClosed + invoice.value_closed;
    });

    return (
        <>
            <Table.Summary.Row>
                <Table.Summary.Cell index={0}></Table.Summary.Cell>
                <Table.Summary.Cell index={1}>Total</Table.Summary.Cell>
                <Table.Summary.Cell index={2}>{formatMoney(total)}</Table.Summary.Cell>
                <Table.Summary.Cell index={3}>{formatMoney(totalOpen)}</Table.Summary.Cell>
                <Table.Summary.Cell index={4}>{formatMoney(totalClosed)}</Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

FinancialPage.auth = {
    role: "admin",
    loading: <LoadingPage />,
    unauthorized: "/signin",
};

export default FinancialPage;
