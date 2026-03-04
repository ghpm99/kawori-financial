import React from "react";
import { render, screen } from "@testing-library/react";

const onChangePaginationMock = jest.fn();
const updateSelectedRowsMock = jest.fn();
const handleSelectFilterMock = jest.fn();
const handleDateRangedFilterMock = jest.fn();
const handleChangeFilterMock = jest.fn();
const onOpenPaymentDetailMock = jest.fn();
const payOffPaymentMock = jest.fn();

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

jest.mock("@/components/filterDropdown/Index", () => ({
    makeFilterDropdownDateRange: ({ onChange }: { onChange: (date: unknown, formatString: string[]) => void }) => {
        onChange(null, ["01/03/2026", "10/03/2026"]);
        return <div>date-filter</div>;
    },
    makeFilterDropdownInput: (name: string, value: string, onChange: (e: { target: { name: string; value: string } }) => void) => {
        onChange({ target: { name, value: value || "abc" } });
        return <div>input-filter</div>;
    },
    makeFilterDropdownSelect: (value: string, options: Array<{ value: string | number }>, onChange: (val: string | number) => void) => {
        onChange(options[0]?.value ?? value);
        return <div>select-filter</div>;
    },
    makeSearchFilterIcon: () => <span>icon</span>,
}));

jest.mock("antd", () => {
    const Table = ({ dataSource, columns, pagination, rowSelection, summary }: any) => {
        pagination?.onChange?.(3, 30);
        rowSelection?.onChange?.([1]);
        columns?.forEach((column: any) => {
            if (column.filterDropdown) column.filterDropdown();
            if (column.filterIcon) column.filterIcon(true);
            if (column.render && dataSource?.[0]) {
                column.render(dataSource[0][column.dataIndex], dataSource[0]);
            }
        });
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
    Table.SELECTION_ALL = "all";
    Table.SELECTION_INVERT = "invert";
    Table.SELECTION_NONE = "none";
    return {
        Table,
        Dropdown: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Space: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Tag: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
        Typography: { Text: ({ children }: { children: React.ReactNode }) => <span>{children}</span> },
    };
});

import PaymentsTable from "./index";

describe("PaymentsTable", () => {
    test("renderiza modo completo com filtros, seleção e summary", () => {
        render(
            <PaymentsTable
                paymentsData={{
                    current_page: 1,
                    total_pages: 1,
                    page_size: 10,
                    has_previous: false,
                    has_next: false,
                    data: [
                        {
                            id: 1,
                            status: 0,
                            type: 0,
                            name: "Pgto 1",
                            date: "2026-03-01",
                            installments: 2,
                            payment_date: "2026-03-10",
                            fixed: false,
                            value: 100,
                            invoice_id: 10,
                            invoice_name: "Inv 10",
                            tags: [{ id: 1, name: "Casa", color: "#fff", is_budget: false, total_closed: 0, total_open: 0, total_payments: 0, total_value: 0 }],
                        },
                    ],
                }}
                isLoading={false}
                onOpenPaymentDetail={onOpenPaymentDetailMock}
                payOffPayment={payOffPaymentMock}
                onChangePagination={onChangePaginationMock}
                handleChangeFilter={handleChangeFilterMock}
                paymentFilters={{ page: 1, page_size: 10, status: "open" }}
                handleDateRangedFilter={handleDateRangedFilterMock}
                selectedRow={[{ id: 1, name: "Pgto 1", selected: false }]}
                handleSelectFilter={handleSelectFilterMock}
                updateSelectedRows={updateSelectedRowsMock}
            />,
        );

        expect(screen.getByTestId("table-rows")).toHaveTextContent("1");
        expect(screen.getByTestId("summary")).toBeInTheDocument();
        expect(onChangePaginationMock).toHaveBeenCalledWith(3, 30);
        expect(updateSelectedRowsMock).toHaveBeenCalled();
        expect(handleChangeFilterMock).toHaveBeenCalled();
        expect(handleDateRangedFilterMock).toHaveBeenCalled();
        expect(handleSelectFilterMock).toHaveBeenCalled();
    });

    test("renderiza modo simplificado", () => {
        render(
            <PaymentsTable
                paymentsData={{
                    current_page: 1,
                    total_pages: 1,
                    page_size: 10,
                    has_previous: false,
                    has_next: false,
                    data: [],
                }}
                isLoading={false}
                onOpenPaymentDetail={jest.fn()}
                payOffPayment={jest.fn()}
                onChangePagination={jest.fn()}
                handleChangeFilter={jest.fn()}
                paymentFilters={{ page: 1, page_size: 10, status: "open" }}
                handleDateRangedFilter={jest.fn()}
                selectedRow={[]}
                handleSelectFilter={jest.fn()}
                updateSelectedRows={jest.fn()}
                simplifiedView
            />,
        );

        expect(screen.getByTestId("table-rows")).toHaveTextContent("0");
    });
});
