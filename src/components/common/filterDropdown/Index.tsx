import { Button } from "antd";
import styles from "./filterDropdown.module.scss";

interface IFilterDropdownProps {
    applyFilter: React.MouseEventHandler<HTMLElement>;
    children: React.ReactNode;
}

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
