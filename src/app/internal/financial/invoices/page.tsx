"use client";

import { useEffect } from "react";

import { ClearOutlined, SearchOutlined, ToTopOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Input, Layout, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { formatMoney, formatterDate, updateSearchParams } from "@/util/index";

import FilterDropdown from "@/components/common/filterDropdown/Index";
import { Payments } from "@/components/invoices/paymentsTable";
import LoadingPage from "@/components/loadingPage/Index";
import ModalPayoff from "@/components/payments/modalPayoff";
import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import { useInvoices } from "@/components/providers/invoices";
import { usePayments } from "@/components/providers/payments";
import { PayoffPayment, usePayoff } from "@/components/providers/payments/payoff";

import styles from "./Invoices.module.scss";

const { Title } = Typography;

function FinancialPage({ searchParams }) {
    const router = useRouter();
    const pathname = usePathname();

    const { invoicesData, isLoading, onChangePagination, invoiceFilters, handleChangeFilter, cleanFilter } =
        useInvoices();

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

    const openPayoffModal = () => {
        openPayoffBatchModal();
        const dataSource: PayoffPayment[] = selectedRow.map((id) => ({
            id: parseInt(id.toString()),
            description: "Aguardando",
            status: "pending",
        }));
        setPaymentsToProcess(dataSource);
    };

    const headerTableFinancial = [
        {
            title: "Nome",
            dataIndex: "name",
            key: "name",
            index: 0,
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
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Valor",
            dataIndex: "value",
            key: "value",
            render: (value: any) => formatMoney(value),
            index: 1,
        },
        {
            title: "Baixado",
            dataIndex: "value_closed",
            key: "value_closed",
            render: (value: any) => formatMoney(value),
            index: 2,
        },
        {
            title: "Em aberto",
            dataIndex: "value_open",
            key: "value_open",
            render: (value: any) => formatMoney(value),
            index: 3,
        },
        {
            title: "Parcelas",
            dataIndex: "installments",
            key: "installments",
        },
        {
            title: "Dia",
            dataIndex: "date",
            key: "date",
            render: (value: any) => formatterDate(value),
        },
        {
            title: "Tags",
            dataIndex: "tags",
            key: "tags",
            render: (_: any, { tags }: IInvoicePagination) => (
                <>
                    {tags.map((tag) => (
                        <Tag color={tag.color} key={`invoice-tags-${tag.id}`}>
                            {tag.name}
                        </Tag>
                    ))}
                </>
            ),
        },
        {
            title: "Ações",
            dataIndex: "action",
            key: "action",
            render: (value: any) => <Link href={`/internal/financial/invoices/details/${value}`}>Detalhes</Link>,
        },
    ];

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
                    rowKey={"id"}
                    pagination={{
                        showSizeChanger: true,
                        pageSize: invoicesData.page_size,
                        current: invoicesData.current_page,
                        total: invoicesData.total_pages * invoicesData.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={headerTableFinancial}
                    dataSource={invoicesData.data}
                    loading={isLoading}
                    summary={(invoiceData) => <TableSummary invoiceData={invoiceData} />}
                    expandable={{
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
                                console.log("expand", record);
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
