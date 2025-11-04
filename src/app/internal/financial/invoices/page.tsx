"use client";

import { useEffect } from "react";

import { ClearOutlined, ToTopOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Table, Tag, Typography } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";

import { setSelectedMenu } from "@/lib/features/auth";
import { changePagination, fetchAllInvoice, setFiltersInvoice } from "@/lib/features/financial/invoice";
import { useAppDispatch } from "@/lib/hooks";
import { RootState } from "@/lib/store";
import { formatMoney, formatterDate, updateSearchParams } from "@/util/index";

import { Payments } from "@/components/invoices/paymentsTable";
import LoadingPage from "@/components/loadingPage/Index";
import ModalPayoff from "@/components/payments/modalPayoff";
import { usePayments } from "@/components/providers/payments";
import { PayoffPayment, usePayoff } from "@/components/providers/payments/payoff";

import styles from "./Invoices.module.scss";

const { Title } = Typography;

function FinancialPage({ searchParams }) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();
    const financialStore = useSelector((state: RootState) => state.financial.invoice);

    const { selectedRow, updateSelectedRows } = usePayments();

    console.log(selectedRow);
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
        document.title = "Kawori Notas";
        dispatch(setSelectedMenu(["financial", "invoices"]));

        dispatch(
            setFiltersInvoice({
                ...searchParams,
            }),
        );
    }, []);

    useEffect(() => {
        updateSearchParams(router, pathname, financialStore.filters);
        dispatch(fetchAllInvoice(financialStore.filters));
    }, [financialStore.filters, dispatch, router, pathname]);

    const cleanFilter = () => {};

    const openPayoffModal = () => {
        openPayoffBatchModal();
        const dataSource: PayoffPayment[] = selectedRow.map((id) => ({
            id: parseInt(id.toString()),
            description: "Aguardando",
            status: "pending",
        }));
        setPaymentsToProcess(dataSource);
    };

    const onChangePagination = (page: number, pageSize: number) => {
        dispatch(
            changePagination({
                page: page,
                pageSize: pageSize,
            }),
        );
    };

    const headerTableFinancial = [
        {
            title: "Id",
            dataIndex: "id",
            key: "id",
            render: (value: any) => <Link href={`/internal/financial/invoices/details/${value}`}>{value}</Link>,
        },
        {
            title: "Nome",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Valor",
            dataIndex: "value",
            key: "value",
            render: (value: any) => formatMoney(value),
        },
        {
            title: "Baixado",
            dataIndex: "value_closed",
            key: "value_closed",
            render: (value: any) => formatMoney(value),
        },
        {
            title: "Em aberto",
            dataIndex: "value_open",
            key: "value_open",
            render: (value: any) => formatMoney(value),
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
                        <Button icon={<ToTopOutlined />} onClick={openPayoffModal} disabled={selectedRow.length === 0}>
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
                        pageSize: financialStore.filters.page_size,
                        current: financialStore.pagination.currentPage,
                        total: financialStore.pagination.totalPages * financialStore.filters.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={headerTableFinancial}
                    dataSource={financialStore.data}
                    loading={financialStore.loading}
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
                <Table.Summary.Cell index={0}>
                    <Text>Total: {formatMoney(total)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                    <Text>Em aberto: {formatMoney(totalOpen)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    <Text>Baixado: {formatMoney(totalClosed)}</Text>
                </Table.Summary.Cell>
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
