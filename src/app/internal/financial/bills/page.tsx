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

const { Title } = Typography;
const { RangePicker } = DatePicker;

const customFormat = ["DD/MM/YYYY", "DD/MM/YYYY"];

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
                onClick: () => onOpenPaymentDetail(record.id),
            },
            {
                key: "3",
                icon: <FontAwesomeIcon icon={faFileCircleCheck} />,
                label: "Pagar",
                disabled: record.status === 1,
                onClick: () => payOffPayment(record.id),
            },
        ];

        return { items };
    };

    const headerTableFinancial = [
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
                        value={paymentFilters?.name__icontains ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Contrato",
            dataIndex: "contract",
            key: "contract",
            render: (value: string, record: any) => (
                <Link href={`/internal/financial/contracts/details/${record.contract_id}`}>{record.contract_name}</Link>
            ),
            filterDropdown: () => (
                <FilterDropdown applyFilter={() => {}}>
                    <Input
                        name="contract"
                        style={{ width: 220 }}
                        onChange={(event) => handleChangeFilter(event)}
                        value={paymentFilters?.contract ?? ""}
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
        },
        {
            title: "Dia de pagamento",
            dataIndex: "payment_date",
            key: "payment_date",
            render: (value: any) => formatterDate(value),
            filterDropdown: () => (
                <FilterDropdown applyFilter={() => {}}>
                    <RangePicker
                        name={"payment_date"}
                        onChange={(_, formatString) => {
                            handleDateRangedFilter("payment_date", formatString);
                        }}
                        format={customFormat}
                        value={[dayjs(paymentFilters?.payment_date__gte), dayjs(paymentFilters?.payment_date__lte)]}
                        ranges={{
                            Hoje: [dayjs(), dayjs()],
                            Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                            "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                            "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                            "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                            "Proximo mês": [
                                dayjs().add(1, "months").startOf("month"),
                                dayjs().add(1, "months").endOf("month"),
                            ],
                            "Mês passado": [
                                dayjs().subtract(1, "month").startOf("month"),
                                dayjs().subtract(1, "month").endOf("month"),
                            ],
                        }}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value: any) => (value === 0 ? "Em aberto" : "Baixado"),
            filterDropdown: () => (
                <FilterDropdown applyFilter={() => {}}>
                    <Select
                        style={{ width: 220 }}
                        options={[
                            { label: "Todos", value: "all" },
                            { label: "Em aberto", value: "open" },
                            { label: "Baixado", value: "done" },
                        ]}
                        onChange={(value) => handleSelectFilter("status", value)}
                        value={paymentFilters?.status ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Tipo",
            dataIndex: "type",
            key: "type",
            render: (text: any) => (text === 0 ? "Credito" : "Debito"),
            filterDropdown: () => (
                <FilterDropdown applyFilter={() => {}}>
                    <Select
                        style={{ width: 220 }}
                        options={[
                            { label: "Todos", value: "" },
                            { label: "Credito", value: 0 },
                            { label: "Debito", value: 1 },
                        ]}
                        onChange={(value) => handleSelectFilter("type", value)}
                        value={paymentFilters?.type ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },
        {
            title: "Data",
            dataIndex: "date",
            key: "dataIndex",
            render: (value: any) => formatterDate(value),
            filterDropdown: () => (
                <FilterDropdown applyFilter={() => {}}>
                    <RangePicker
                        name={"date"}
                        onChange={(_, formatString) => {
                            handleDateRangedFilter("date", formatString);
                        }}
                        format={customFormat}
                        value={[dayjs(paymentFilters?.date__gte), dayjs(paymentFilters?.date__lte)]}
                        ranges={{
                            Hoje: [dayjs(), dayjs()],
                            Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                            "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                            "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                            "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                            "Proximo mês": [
                                dayjs().add(1, "months").startOf("month"),
                                dayjs().add(1, "months").endOf("month"),
                            ],
                            "Mês passado": [
                                dayjs().subtract(1, "month").startOf("month"),
                                dayjs().subtract(1, "month").endOf("month"),
                            ],
                        }}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
        },

        {
            title: "Parcela",
            dataIndex: "installments",
            key: "installments",
        },

        {
            title: "Fixo",
            dataIndex: "fixed",
            key: "fixed",
            render: (value: any) => (value ? "Sim" : "Não"),
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
    ];

    return (
        <>
            <Breadcrumb className={styles.breadcrumb}>
                <Breadcrumb.Item>Kawori</Breadcrumb.Item>
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
                <Table
                    pagination={{
                        showSizeChanger: true,
                        pageSize: paymentsData.page_size,
                        current: paymentsData.current_page,
                        total: paymentsData.total_pages * paymentsData.page_size,
                        onChange: onChangePagination,
                    }}
                    columns={headerTableFinancial}
                    rowSelection={{
                        type: "checkbox",
                        selectedRowKeys: selectedRow.filter((x) => x.selected).map((x) => x.id),
                        onChange: (selectedRowKeys, selectedRows) => {
                            const selectedRowArray = paymentsData.data.map(
                                (item) =>
                                    ({
                                        id: item.id,
                                        selected: selectedRowKeys.includes(item.id),
                                    }) as SelectedRowType,
                            );
                            updateSelectedRows(selectedRowArray);
                        },
                        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
                        getCheckboxProps: (record) => ({
                            disabled: record.status === 1,
                        }),
                    }}
                    dataSource={paymentsData.data}
                    loading={isLoading}
                    summary={(paymentData) => <TableSummary paymentData={paymentData} />}
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

function TableSummary({ paymentData }: { paymentData: readonly IPaymentPagination[] }) {
    const { Text } = Typography;

    let total = 0;
    let totalCredit = 0;
    let totalDebit = 0;
    paymentData.forEach((payment) => {
        if (payment.type === 0) {
            total = total + payment.value;
            totalCredit = totalCredit + payment.value;
        } else {
            total = total - payment.value;
            totalDebit = totalDebit + payment.value;
        }
    });

    return (
        <>
            <Table.Summary.Row>
                <Table.Summary.Cell colSpan={2} index={0}>
                    <Text>Total: {formatMoney(total)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                    <Text>Total Credito: {formatMoney(totalCredit)}</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                    <Text>Total Debito: {formatMoney(totalDebit)}</Text>
                </Table.Summary.Cell>
            </Table.Summary.Row>
        </>
    );
}

export default BillsPage;
