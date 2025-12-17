"use client";

import { faEllipsis, faFileCircleCheck, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, Dropdown, MenuProps, Space, Table, TableProps, Typography } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import { formatMoney, formatterDate } from "@/util/index";

import {
    makeFilterDropdownDateRange,
    makeFilterDropdownInput,
    makeFilterDropdownSelect,
    makeSearchFilterIcon,
} from "@/components/filterDropdown/Index";
import { IPaymentFilters, IPaymentPagination, PaymentItem, PaymentsPage } from "@/components/providers/payments";
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
    simplifiedView?: boolean;
}
type ColumnKey =
    | "name"
    | "invoice"
    | "value"
    | "paymentDate"
    | "status"
    | "type"
    | "date"
    | "installments"
    | "fixed"
    | "actions";

type Columns = NonNullable<TableProps<PaymentItem>["columns"]>;
type SingleColumn = Columns[number];
type ColumnFactory = Record<ColumnKey, () => SingleColumn>;

const simplifiedOrder: ColumnKey[] = ["name", "value", "paymentDate", "actions"];

const fullOrder: ColumnKey[] = [
    "name",
    "invoice",
    "value",
    "paymentDate",
    "status",
    "type",
    "date",
    "installments",
    "fixed",
    "actions",
];

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
    simplifiedView,
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

    const columnFactory: ColumnFactory = {
        name: (): SingleColumn => ({
            title: "Nome",
            dataIndex: "name",
            key: "name",
            filterDropdown: () =>
                makeFilterDropdownInput("name__icontains", paymentFilters?.name__icontains ?? "", handleChangeFilter),
            filterIcon: makeSearchFilterIcon,
        }),
        value: (): SingleColumn => ({
            title: "Valor",
            dataIndex: "value",
            key: "value",
            render: formatMoney,
        }),

        paymentDate: (): SingleColumn => ({
            title: "Dia de pagamento",
            dataIndex: "payment_date",
            key: "payment_date",
            render: formatterDate,
            filterDropdown: () =>
                makeFilterDropdownDateRange({
                    name: "payment_date",
                    value: [dayjs(paymentFilters?.payment_date__gte), dayjs(paymentFilters?.payment_date__lte)],
                    onChange: (_, formatString) => handleDateRangedFilter("payment_date", formatString),
                }),
            filterIcon: makeSearchFilterIcon,
        }),

        invoice: (): SingleColumn => ({
            title: "Nota",
            dataIndex: "invoice",
            key: "invoice",
            render: (_, record) => (
                <Link href={`/internal/financial/invoices/details/${record.invoice_id}`}>{record.invoice_name}</Link>
            ),
            filterDropdown: () =>
                makeFilterDropdownInput("contract", paymentFilters?.invoice ?? "", handleChangeFilter),
            filterIcon: makeSearchFilterIcon,
        }),

        status: (): SingleColumn => ({
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (value) => (value === 0 ? "Em aberto" : "Baixado"),
            filterDropdown: () =>
                makeFilterDropdownSelect(
                    paymentFilters?.status ?? "",
                    [
                        { label: "Todos", value: "all" },
                        { label: "Em aberto", value: "open" },
                        { label: "Baixado", value: "done" },
                    ],
                    (value) => handleSelectFilter("status", value),
                ),
            filterIcon: makeSearchFilterIcon,
        }),

        type: (): SingleColumn => ({
            title: "Tipo",
            dataIndex: "type",
            key: "type",
            render: (value) => (value === 0 ? "Credito" : "Debito"),
            filterDropdown: () =>
                makeFilterDropdownSelect(
                    paymentFilters?.type ?? "",
                    [
                        { label: "Todos", value: "" },
                        { label: "Credito", value: 0 },
                        { label: "Debito", value: 1 },
                    ],
                    (value) => handleSelectFilter("type", value),
                ),
            filterIcon: makeSearchFilterIcon,
        }),

        date: (): SingleColumn => ({
            title: "Data",
            dataIndex: "date",
            key: "date",
            render: formatterDate,
            filterDropdown: () =>
                makeFilterDropdownDateRange({
                    name: "date",
                    value: [dayjs(paymentFilters?.date__gte), dayjs(paymentFilters?.date__lte)],
                    onChange: (_, formatString) => handleDateRangedFilter("date", formatString),
                }),
            filterIcon: makeSearchFilterIcon,
        }),

        installments: (): SingleColumn => ({
            title: "Parcela",
            dataIndex: "installments",
            key: "installments",
        }),

        fixed: (): SingleColumn => ({
            title: "Fixo",
            dataIndex: "fixed",
            key: "fixed",
            render: (value) => (value ? "Sim" : "Não"),
        }),

        actions: (): SingleColumn => ({
            title: "Ações",
            dataIndex: "id",
            key: "actions",
            render: (_, record) => (
                <Dropdown menu={createDropdownMenu(record)}>
                    <a onClick={(e) => e.preventDefault()}>
                        <Space>
                            <FontAwesomeIcon icon={faEllipsis} />
                        </Space>
                    </a>
                </Dropdown>
            ),
        }),
    };

    const columnsTable = (): TableProps<PaymentItem>["columns"] => {
        const order = simplifiedView ? simplifiedOrder : fullOrder;
        return order.map((key) => columnFactory[key]());
    };

    return (
        <Table
            title={() => "Pagamentos"}
            scroll={{ x: "max-content" }}
            pagination={{
                showSizeChanger: !simplifiedView,
                pageSize: paymentsData.page_size,
                current: paymentsData.current_page,
                total: paymentsData.total_pages * paymentsData.page_size,
                onChange: onChangePagination,
            }}
            columns={columnsTable()}
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
            summary={simplifiedView ? undefined : (paymentData) => <TableSummary paymentData={paymentData} />}
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
