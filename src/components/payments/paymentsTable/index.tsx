"use client";

import { SearchOutlined } from "@ant-design/icons";
import { faEllipsis, faFileCircleCheck, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, Dropdown, Input, MenuProps, Select, Space, Table, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import { formatMoney, formatterDate } from "@/util/index";

import FilterDropdown from "@/components/common/filterDropdown/Index";
import { SelectedRowType } from "@/components/providers/selectPayments";

const { RangePicker } = DatePicker;

interface IPaymentsTableProps {
    paymentsData: PaymentsPage;
    isLoading: boolean;
    onOpenPaymentDetail: (paymentId?: number) => void;
    payOffPayment: (id: number) => void;
    onChangePagination: (page: number, pageSize: number) => void;
    handleChangeFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
    paymentFilters: IPaymentFilters;
    handleDateRangedFilter: (name: string, dates: string[]) => void;
    selectedRow: SelectedRowType[];
    handleSelectFilter: (name: keyof IPaymentFilters, value: string | number) => void;
    updateSelectedRows: (keys: SelectedRowType[]) => void;
}

const customFormat = ["DD/MM/YYYY", "DD/MM/YYYY"];

const PaymentsTable = ({
    paymentsData,
    isLoading,
    onOpenPaymentDetail,
    payOffPayment,
    onChangePagination,
    handleChangeFilter,
    paymentFilters,
    handleDateRangedFilter,
    selectedRow,
    handleSelectFilter,
    updateSelectedRows,
}: IPaymentsTableProps) => {
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

    return (
        <Table
            title={() => "Pagamentos"}
            scroll={{ x: "max-content" }}
            pagination={{
                showSizeChanger: true,
                pageSize: paymentsData.page_size,
                current: paymentsData.current_page,
                total: paymentsData.total_pages * paymentsData.page_size,
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
                                value={paymentFilters?.name__icontains ?? ""}
                            />
                        </FilterDropdown>
                    ),
                    filterIcon: (filtered: boolean) => (
                        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                    ),
                },
                {
                    title: "Nota",
                    dataIndex: "invoice",
                    key: "invoice",
                    render: (_, record) => (
                        <Link href={`/internal/financial/invoices/details/${record.invoice_id}`}>
                            {record.invoice_name}
                        </Link>
                    ),
                    filterDropdown: () => (
                        <FilterDropdown applyFilter={() => {}}>
                            <Input
                                name="contract"
                                style={{ width: 220 }}
                                onChange={(event) => handleChangeFilter(event)}
                                value={paymentFilters?.invoice ?? ""}
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
                    title: "Dia de pagamento",
                    dataIndex: "payment_date",
                    key: "payment_date",
                    render: (value) => formatterDate(value),
                    filterDropdown: () => (
                        <FilterDropdown applyFilter={() => {}}>
                            <RangePicker
                                name={"payment_date"}
                                onChange={(_, formatString) => {
                                    handleDateRangedFilter("payment_date", formatString);
                                }}
                                format={customFormat}
                                value={[
                                    dayjs(paymentFilters?.payment_date__gte),
                                    dayjs(paymentFilters?.payment_date__lte),
                                ]}
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
                    filterIcon: (filtered: boolean) => (
                        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                    ),
                },
                {
                    title: "Status",
                    dataIndex: "status",
                    key: "status",
                    render: (value) => (value === 0 ? "Em aberto" : "Baixado"),
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
                    filterIcon: (filtered: boolean) => (
                        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                    ),
                },
                {
                    title: "Tipo",
                    dataIndex: "type",
                    key: "type",
                    render: (text) => (text === 0 ? "Credito" : "Debito"),
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
                    filterIcon: (filtered: boolean) => (
                        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                    ),
                },
                {
                    title: "Data",
                    dataIndex: "date",
                    key: "dataIndex",
                    render: (value) => formatterDate(value),
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
                    filterIcon: (filtered: boolean) => (
                        <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                    ),
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
                    render: (value) => (value ? "Sim" : "Não"),
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
            rowSelection={{
                type: "checkbox",
                selectedRowKeys: selectedRow.filter((x) => x.selected).map((x) => x.id),
                onChange: (selectedRowKeys) => {
                    const selectedRowArray = paymentsData.data.map(
                        (item) =>
                            ({
                                id: item.id,
                                name: item.name,
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
    );
};

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

export default PaymentsTable;
