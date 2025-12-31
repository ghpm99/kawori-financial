import { ChangeEvent } from "react";

import { SearchOutlined } from "@ant-design/icons";
import { faEllipsis, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, Input, MenuProps, Space, Table, TableProps, Tag } from "antd";

import { formatMoney, formatterDate } from "@/util";

import { InvoicePayments } from "../payments";
import { IInvoiceFilters, IInvoicePagination, InvoicesPage } from "@/components/providers/invoices";
import FilterDropdown from "@/components/filterDropdown/Index";
import { ITags } from "@/components/providers/tags";

interface IInvoicesTable {
    data: InvoicesPage;
    isLoading: boolean;
    filters: IInvoiceFilters;
    onOpenInvoiceDetail: (invoiceId?: number) => void;
    onChangePagination: (page: number, pageSize: number) => void;
    handleChangeFilter: (e: ChangeEvent<HTMLInputElement>) => void;
    simplifiedView?: boolean;
}
const InvoicesTable = ({
    data,
    isLoading,
    filters,
    onOpenInvoiceDetail,
    onChangePagination,
    handleChangeFilter,
    simplifiedView,
}: IInvoicesTable) => {
    const createDropdownMenu = (record: IInvoicePagination): MenuProps => {
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
                onClick: () => onOpenInvoiceDetail(record.id),
            },
        ];

        return { items };
    };

    const columnsTable = (): TableProps<IInvoicePagination>["columns"] => {
        const columns: TableProps<IInvoicePagination>["columns"] = [
            {
                title: "Nome",
                dataIndex: "name",
                key: "name",
                width: 520,
                filterDropdown: () => (
                    <FilterDropdown applyFilter={() => {}}>
                        <Input
                            name="name__icontains"
                            style={{ width: 220 }}
                            onChange={(event) => handleChangeFilter(event)}
                            value={filters?.name__icontains ?? ""}
                        />
                    </FilterDropdown>
                ),
                filterIcon: (filtered: boolean) => (
                    <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
                ),
            },
            {
                title: "Proximo pagamento",
                dataIndex: "next_payment",
                key: "next_payment",
                render: (value: string) => formatterDate(value),
            },
            {
                title: "Tags",
                dataIndex: "tags",
                key: "tags",
                render: (_: ITags[], { tags }: IInvoicePagination) =>
                    tags.map((tag) => (
                        <Tag color={tag.color} key={`invoice-tags-${tag.id}`}>
                            {tag.name}
                        </Tag>
                    )),
            },
            {
                title: "Ações",
                dataIndex: "id",
                key: "id",
                render: (_: number, record: IInvoicePagination) => (
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

        if (simplifiedView) return columns;

        columns.splice(
            1,
            0,
            {
                title: "Valor",
                dataIndex: "value",
                key: "value",
                render: (value: number) => formatMoney(value),
            },
            {
                title: "Baixado",
                dataIndex: "value_closed",
                key: "value_closed",
                render: (value: number) => formatMoney(value),
            },
            {
                title: "Em aberto",
                dataIndex: "value_open",
                key: "value_open",
                render: (value: number) => formatMoney(value),
            },
            {
                title: "Parcelas",
                dataIndex: "installments",
                key: "installments",
            },
        );
        return columns;
    };

    return (
        <Table
            scroll={{ x: "max-content" }}
            rowKey={"id"}
            pagination={{
                showSizeChanger: !simplifiedView,
                pageSize: data.page_size,
                current: data.current_page,
                total: data.total_pages * data.page_size,
                onChange: onChangePagination,
            }}
            columns={columnsTable()}
            dataSource={data.data}
            loading={isLoading}
            summary={simplifiedView ? undefined : (invoiceData) => <TableSummary invoiceData={invoiceData} />}
            expandable={{
                expandedRowRender: (record) => <InvoicePayments invoice={record} pageSize={2} />,
                rowExpandable: (record) => {
                    return record?.installments > 0;
                },
            }}
        />
    );
};

function TableSummary({ invoiceData }: { invoiceData: readonly IInvoicePagination[] }) {
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

export default InvoicesTable;
