import { ChangeEvent } from "react";

import { SearchOutlined } from "@ant-design/icons";
import { faEllipsis, faFilePen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, Input, MenuProps, Space, Table, Tag } from "antd";

import { formatMoney, formatterDate } from "@/util";

import FilterDropdown from "@/components/common/filterDropdown/Index";

import { InvoicePayments } from "../payments";



interface IInvoicesTable {
    data: InvoicesPage;
    isLoading: boolean;
    filters: IInvoiceFilters;
    onOpenInvoiceDetail: (invoiceId?: number) => void;
    onChangePagination: (page: number, pageSize: number) => void;
    handleChangeFilter: (e: ChangeEvent<HTMLInputElement>) => void;
}
const InvoicesTable = ({
    data,
    isLoading,
    filters,
    onOpenInvoiceDetail,
    onChangePagination,
    handleChangeFilter,
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
    return (
        <Table
            scroll={{ x: "max-content" }}
            rowKey={"id"}
            pagination={{
                showSizeChanger: true,
                pageSize: data.page_size,
                current: data.current_page,
                total: data.total_pages * data.page_size,
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
                                value={filters?.name__icontains ?? ""}
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
                    title: "Baixado",
                    dataIndex: "value_closed",
                    key: "value_closed",
                    render: (value) => formatMoney(value),
                },
                {
                    title: "Em aberto",
                    dataIndex: "value_open",
                    key: "value_open",
                    render: (value) => formatMoney(value),
                },
                {
                    title: "Parcelas",
                    dataIndex: "installments",
                    key: "installments",
                },
                {
                    title: "Proximo pagamento",
                    dataIndex: "next_payment",
                    key: "next_payment",
                    render: (value) => formatterDate(value),
                },
                {
                    title: "Tags",
                    dataIndex: "tags",
                    key: "tags",
                    render: (_, { tags }: IInvoicePagination) =>
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
            dataSource={data.data}
            loading={isLoading}
            summary={(invoiceData) => <TableSummary invoiceData={invoiceData} />}
            expandable={{
                expandedRowRender: (record) => <InvoicePayments invoice={record} />,
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
