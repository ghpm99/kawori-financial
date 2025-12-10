import InvoicesTable from "@/components/invoices/invoicesTable";
import { IInvoiceFilters, InvoicesProvider, useInvoices } from "@/components/providers/invoices";
import { Card, Col } from "antd";
import { memo } from "react";
import styles from "./InvoicesSection.module.scss";

const InvoicesSection = ({ title, filters }: { title: string; filters: IInvoiceFilters }) => {
    return (
        <Col xs={24} lg={8}>
            <Card title={title} className={styles.transactionsCard}>
                <div style={{ minHeight: 300 }}>
                    <InvoicesProvider customDefaultFilters={filters} enableUpdateSearchParams={false}>
                        <InvoiceTable />
                    </InvoicesProvider>
                </div>
            </Card>
        </Col>
    );
};

const InvoiceTable = () => {
    const { invoicesData, isLoading, onChangePagination, invoiceFilters, handleChangeFilter, onOpenInvoiceDetail } =
        useInvoices();

    return (
        <InvoicesTable
            simplifiedView
            data={invoicesData}
            isLoading={isLoading}
            filters={invoiceFilters}
            handleChangeFilter={handleChangeFilter}
            onChangePagination={onChangePagination}
            onOpenInvoiceDetail={onOpenInvoiceDetail}
        />
    );
};

export default memo(InvoicesSection);
