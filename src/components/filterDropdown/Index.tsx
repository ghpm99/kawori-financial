import { SearchOutlined } from "@ant-design/icons";
import { Button, DatePicker, DatePickerProps, Input, Select } from "antd";
import dayjs from "dayjs";
import { ChangeEventHandler } from "react";
import { customFormat } from "../constants";
import styles from "./filterDropdown.module.scss";

const { RangePicker } = DatePicker;
type RangeValue = NonNullable<React.ComponentProps<typeof DatePicker.RangePicker>["value"]>;

interface IFilterDropdownProps {
    applyFilter: React.MouseEventHandler<HTMLElement>;
    children: React.ReactNode;
}

export const makeSearchFilterIcon = (filtered: boolean) => (
    <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
);

export const makeFilterDropdownInput = (
    name: string,
    value: string,
    onChange: ChangeEventHandler<HTMLInputElement>,
) => (
    <FilterDropdown applyFilter={() => {}}>
        <Input name={name} style={{ width: 220 }} onChange={onChange} value={value} />
    </FilterDropdown>
);

export const makeFilterDropdownSelect = (
    value: string,
    options: unknown[],
    onChange: (value: string, option?: unknown) => void,
) => (
    <FilterDropdown applyFilter={() => {}}>
        <Select style={{ width: 220 }} options={options} value={value} onChange={onChange} />
    </FilterDropdown>
);

export const makeFilterDropdownDateRange = ({
    name,
    value,
    onChange,
}: {
    name: string;
    value: RangeValue | null | undefined;
    onChange: DatePickerProps["onChange"];
}) => (
    <FilterDropdown applyFilter={() => {}}>
        <RangePicker
            name={name}
            onChange={onChange}
            format={customFormat}
            value={value}
            ranges={{
                Hoje: [dayjs(), dayjs()],
                Ontem: [dayjs().subtract(1, "days"), dayjs().subtract(1, "days")],
                "Últimos 7 dias": [dayjs().subtract(7, "days"), dayjs()],
                "Últimos 30 dias": [dayjs().subtract(30, "days"), dayjs()],
                "Mês atual": [dayjs().startOf("month"), dayjs().endOf("month")],
                "Proximo mês": [dayjs().add(1, "months").startOf("month"), dayjs().add(1, "months").endOf("month")],
                "Mês passado": [
                    dayjs().subtract(1, "month").startOf("month"),
                    dayjs().subtract(1, "month").endOf("month"),
                ],
            }}
        />
    </FilterDropdown>
);

const FilterDropdown = (props: IFilterDropdownProps) => {
    return (
        <div className={styles["filter-dropdown"]}>
            {props.children}
            <Button type="link" size="small" onClick={props.applyFilter}>
                Aplicar
            </Button>
        </div>
    );
};

export default FilterDropdown;
