"use client";

import { ClearOutlined, FileAddOutlined, ToTopOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Typography } from "antd";

import InvoiceDrawer from "@/components/invoices/invoiceDrawer";
import InvoicesTable from "@/components/invoices/invoicesTable";
import { useInvoices } from "@/components/providers/invoices";
import { usePayoff } from "@/components/providers/payoff";
import { useSelectPayments } from "@/components/providers/selectPayments";
import { useTags } from "@/components/providers/tags";

import styles from "./Payments.module.scss";
import { useEffect } from "react";

const { Title } = Typography;

function ScheduledBillsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
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
        onCreateNewInvoice,
        updateFiltersBySearchParams,
    } = useInvoices();

    useEffect(() => {
        Promise.resolve(searchParams).then((params) => {
            updateFiltersBySearchParams(params);
        });
    }, []);

    const { selectedRow } = useSelectPayments();

    const { openPayoffBatchModal } = usePayoff();

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Notas</Breadcrumb.Item>
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
                            onClick={openPayoffBatchModal}
                            disabled={selectedRow.filter((item) => item.selected).length === 0}
                        >
                            Baixar pagamentos
                        </Button>
                        <Button icon={<ClearOutlined />} onClick={cleanFilter}>
                            Limpar filtros
                        </Button>
                    </div>
                </div>
                <InvoicesTable
                    data={invoicesData}
                    isLoading={isLoading}
                    filters={invoiceFilters}
                    handleChangeFilter={handleChangeFilter}
                    onChangePagination={onChangePagination}
                    onOpenInvoiceDetail={onOpenInvoiceDetail}
                />
            </Layout>
            <InvoiceDrawer
                open={invoiceDetailVisible}
                onClose={onCloseInvoiceDetail}
                invoiceDetail={invoiceDetail}
                isLoading={isLoadingInvoiceDetail}
                onUpdateInvoiceDetail={onUpdateInvoiceDetail}
                onCreateNewInvoice={onCreateNewInvoice}
                tags_data={tags}
                isLoadingTags={isLoadingTags}
            />
        </>
    );
}

export default ScheduledBillsPage;
