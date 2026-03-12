import React from "react";
import { render, screen } from "@testing-library/react";

const onChangePaginationMock = jest.fn();

jest.mock("antd", () => {
    const Table = ({ dataSource, columns, summary, pagination, expandable }: any) => {
        pagination?.onChange?.(2, 20);
        columns?.forEach((column: any) => {
            if (column.filterDropdown) column.filterDropdown();
            if (column.filterIcon) column.filterIcon(true);
            if (column.render && dataSource?.[0]) {
                column.render(dataSource[0][column.dataIndex], dataSource[0]);
            }
        });
        if (expandable?.rowExpandable?.(dataSource?.[0])) {
            expandable.expandedRowRender(dataSource[0]);
        }
        return (
            <div>
                <div data-testid="table-rows">{String(dataSource?.length || 0)}</div>
                {summary ? <div data-testid="summary">{summary(dataSource)}</div> : null}
            </div>
        );
    };
    Table.Summary = {
        Row: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Cell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    };

    return {
        Table,
        Dropdown: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Input: ({ onChange }: { onChange: (e: { target: { name: string; value: string } }) => void }) => {
            onChange({ target: { name: "name__icontains", value: "abc" } });
            return <input />;
        },
        Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
    };
});

jest.mock("@/components/filterDropdown/Index", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../payments", () => ({
    InvoicePayments: ({ invoiceData }: { invoiceData: { id: number } }) => <div>invoice-payments-{invoiceData.id}</div>,
}));

import InvoicesTable from "./index";

describe("InvoicesTable", () => {
    test("renderiza tabela completa com summary e expansao", () => {
        const handleChangeFilter = jest.fn();

        render(
            <InvoicesTable
                data={{
                    current_page: 1,
                    total_pages: 1,
                    page_size: 10,
                    has_previous: false,
                    has_next: false,
                    data: [
                        {
                            id: 1,
                            status: 0,
                            name: "Nota A",
                            installments: 2,
                            value: 100,
                            value_open: 30,
                            value_closed: 70,
                            date: "2026-03-01",
                            next_payment: "2026-03-10",
                            tags: [
                                {
                                    id: 1,
                                    name: "Casa",
                                    color: "#fff",
                                    is_budget: false,
                                    total_closed: 0,
                                    total_open: 0,
                                    total_payments: 0,
                                    total_value: 0,
                                },
                            ],
                        },
                    ],
                }}
                isLoading={false}
                filters={{ page: 1, page_size: 10, status: "open" }}
                onOpenInvoiceDetail={jest.fn()}
                onChangePagination={onChangePaginationMock}
                handleChangeFilter={handleChangeFilter}
            />,
        );

        expect(screen.getByTestId("table-rows")).toHaveTextContent("1");
        expect(screen.getByTestId("summary")).toBeInTheDocument();
        expect(onChangePaginationMock).toHaveBeenCalledWith(2, 20);
    });

    test("renderiza tabela simplificada sem summary", () => {
        render(
            <InvoicesTable
                data={{
                    current_page: 1,
                    total_pages: 1,
                    page_size: 10,
                    has_previous: false,
                    has_next: false,
                    data: [],
                }}
                isLoading={false}
                filters={{ page: 1, page_size: 10, status: "open" }}
                onOpenInvoiceDetail={jest.fn()}
                onChangePagination={jest.fn()}
                handleChangeFilter={jest.fn()}
                simplifiedView
            />,
        );

        expect(screen.getByTestId("table-rows")).toHaveTextContent("0");
    });
});
