"use client";
import { useEffect } from "react";

import { ClearOutlined, SearchOutlined, ToTopOutlined } from "@ant-design/icons";
import { faEllipsis, faFileCircleCheck, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Breadcrumb,
    Button,
    DatePicker,
    Dropdown,
    Input,
    Layout,
    MenuProps,
    Select,
    Space,
    Table,
    Typography,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { formatMoney, formatterDate, updateSearchParams } from "@/util/index";

import FilterDropdown from "@/components/common/filterDropdown/Index";
import ModalPayoff from "@/components/payments/modalPayoff";
import PaymentsDrawer from "@/components/payments/paymentsDrawer";
import { SelectedRowType, usePayments } from "@/components/providers/payments";
import { PayoffPayment, usePayoff } from "@/components/providers/payments/payoff";

import styles from "./Payments.module.scss";
import PaymentsTable from "@/components/payments/paymentsTable";

const { Title } = Typography;

function BillsPage({ searchParams }) {
    const {
        paymentFilters,
        paymentsData,
        isLoading,
        onChangePagination,
        handleChangeFilter,
        handleDateRangedFilter,
        handleSelectFilter,
        handleChangeAllFilters,
        updateFiltersBySearchParams,
        cleanFilter,
        selectedRow,
        paymentDetailVisible,
        onClosePaymentDetail,
        onOpenPaymentDetail,
        isLoadingPaymentDetail,
        paymentDetail,
        onUpdatePaymentDetail,
        updateSelectedRows,
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

    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        document.title = "Kawori Pagamentos";
        // dispatch(setSelectedMenu(["financial", "payments"]));
        updateFiltersBySearchParams(searchParams);
    }, []);

    useEffect(() => {
        updateSearchParams(router, pathname, paymentFilters);
    }, [paymentFilters, router, pathname]);

    const openPayoffModal = () => {
        openPayoffBatchModal();
        const dataSource: PayoffPayment[] = selectedRow.map((id) => ({
            id: parseInt(id.toString()),
            description: "Aguardando",
            status: "pending",
        }));
        setPaymentsToProcess(dataSource);
    };

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
                        <Button icon={<ToTopOutlined />} onClick={openPayoffModal} disabled={selectedRow.length === 0}>
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
            </Layout>
        </>
    );
}

export default BillsPage;
