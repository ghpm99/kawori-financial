"use client";
import { useEffect } from "react";

import { ClearOutlined, ToTopOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Layout, Typography } from "antd";
import { usePathname, useRouter } from "next/navigation";

import { updateSearchParams } from "@/util/index";

import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import PaymentsTable from "@/components/payments/paymentsTable";
import { usePayments } from "@/components/providers/payments";
import { usePayoff } from "@/components/providers/payoff";
import { useSelectPayments } from "@/components/providers/selectPayments";

import styles from "./Payments.module.scss";

const { Title } = Typography;

function BillsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
    const {
        paymentFilters,
        paymentsData,
        refetchPayments,
        isLoading,
        onChangePagination,
        handleChangeFilter,
        handleDateRangedFilter,
        handleSelectFilter,
        updateFiltersBySearchParams,
        cleanFilter,
        paymentDetailVisible,
        onClosePaymentDetail,
        onOpenPaymentDetail,
        isLoadingPaymentDetail,
        paymentDetail,
        onUpdatePaymentDetail,
    } = usePayments();

    const { selectedRow, updateSelectedRows } = useSelectPayments();

    const { setCallback, openPayoffBatchModal, payOffPayment } = usePayoff();

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        Promise.resolve(searchParams).then((params) => {
            updateFiltersBySearchParams(params);
        });
    }, []);

    useEffect(() => {
        updateSearchParams(router, pathname, paymentFilters);
    }, [paymentFilters, router, pathname]);

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item href="/">Kawori</Breadcrumb.Item>
                <Breadcrumb.Item>Financeiro</Breadcrumb.Item>
                <Breadcrumb.Item>Pagamentos</Breadcrumb.Item>
            </Breadcrumb>
            <Layout>
                <div className={styles.header_command}>
                    <Title level={3} className={styles.title}>
                        Pagamentos
                    </Title>
                    <div>
                        <Button
                            icon={<ToTopOutlined />}
                            onClick={() => {
                                setCallback(() => {
                                    refetchPayments();
                                });
                                openPayoffBatchModal();
                            }}
                            disabled={selectedRow.length === 0}
                        >
                            Baixar pagamentos
                        </Button>
                        <Button icon={<ClearOutlined />} onClick={cleanFilter}>
                            Limpar filtros
                        </Button>
                    </div>
                </div>
                <PaymentsTable
                    handleChangeFilter={handleChangeFilter}
                    handleDateRangedFilter={handleDateRangedFilter}
                    handleSelectFilter={handleSelectFilter}
                    isLoading={isLoading}
                    onChangePagination={onChangePagination}
                    onOpenPaymentDetail={onOpenPaymentDetail}
                    payOffPayment={payOffPayment}
                    paymentFilters={paymentFilters}
                    paymentsData={paymentsData}
                    selectedRow={selectedRow}
                    updateSelectedRows={updateSelectedRows}
                />
                <PaymentsDrawer
                    onClose={onClosePaymentDetail}
                    open={paymentDetailVisible}
                    paymentDetail={paymentDetail}
                    isLoading={isLoadingPaymentDetail}
                    onUpdatePaymentDetail={onUpdatePaymentDetail}
                />
            </Layout>
        </>
    );
}

export default BillsPage;
