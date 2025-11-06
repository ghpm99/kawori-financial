"use client";

import { SearchOutlined } from "@ant-design/icons";
import { faEllipsis, faFileCircleCheck, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import { DatePicker, Dropdown, MenuProps, Select, Space, Table, Typography } from "antd";
import dayjs from "dayjs";

import { fetchDetailInvoicePaymentsService } from "@/services/financial";
import { formatMoney, formatterDate } from "@/util/index";

import FilterDropdown from "@/components/common/filterDropdown/Index";
import { SelectedRowType, usePayments } from "@/components/providers/payments";
import { usePayoff } from "@/components/providers/payments/payoff";
import { usePaymentsTable } from "@/components/providers/paymentsTable";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const customFormat = ["DD/MM/YYYY", "DD/MM/YYYY"];

const defaultPaymentsPage: PaymentsPage = {
    current_page: 1,
    total_pages: 1,
    page_size: 10,
    has_previous: false,
    has_next: false,
    data: [],
};

interface PaymentsTableProps {
    invoice: IInvoicePagination;
    payOffPayment: (id: number) => void;
    selectedRow: SelectedRowType[];
    updateSelectedRows: (keys: SelectedRowType[]) => void;
}

const PaymentsTable = ({ invoice, selectedRow, updateSelectedRows }: PaymentsTableProps) => {
    const {
        paymentFilters,
        onChangePagination,
        handleChangeFilter,
        handleDateRangedFilter,
        handleSelectFilter,
        handleChangeAllFilters,
        updateFiltersBySearchParams,
        cleanFilter,
        paymentDetailVisible,
        onClosePaymentDetail,

        isLoadingPaymentDetail,
        paymentDetail,
        onUpdatePaymentDetail,
    } = usePaymentsTable();

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

    const { onOpenPaymentDetail } = usePayments();

    const {
        data,
        refetch: refetchPayments,
        isLoading,
    } = useQuery({
        queryKey: ["paymentsTable", invoice.id],
        queryFn: async () => {
            const response = await fetchDetailInvoicePaymentsService(invoice.id, { page: 1, page_size: 10 });
            const data = response.data;
            if (!data) return defaultPaymentsPage;

            return {
                ...data,
                data: data.data.map((item) => ({
                    ...item,
                    key: item.id,
                })),
            };
        },
    });

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
            title: "Parcela",
            dataIndex: "installments",
            key: "installments",
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
                        // onChange={(value) => handleSelectFilter("status", value)}
                        // value={paymentFilters?.status ?? ""}
                    />
                </FilterDropdown>
            ),
            filterIcon: (filtered: boolean) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
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
            title: "Valor",
            dataIndex: "value",
            key: "value",
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
    ];

    return (
        <Table
            pagination={{
                showSizeChanger: true,
                pageSize: data?.page_size,
                current: data?.current_page,
                total: data?.total_pages * data?.page_size,
                onChange: onChangePagination,
            }}
            columns={headerTableFinancial}
            rowSelection={{
                type: "checkbox",
                selectedRowKeys: selectedRow.filter((item) => item.selected).map((item) => item.id),
                onChange: (selectedRowKeys, selectedRows) => {
                    const selectedRowArray = data?.data.map(
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
            dataSource={data?.data ?? []}
            loading={isLoading}
        />
    );
};

export default PaymentsTable;
