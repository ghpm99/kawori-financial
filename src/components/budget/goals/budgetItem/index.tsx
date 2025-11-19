import { InputNumber, Slider, SliderSingleProps } from "antd";

import { IBudget } from "@/components/providers/budget";

import styles from "./budgetItem.module.scss";

const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (value) => `${value}%`;

const BudgetItem = ({
    item,
    handleChangeAllocationPercentage,
}: {
    item: IBudget;
    handleChangeAllocationPercentage: (allocationPercentage: number) => void;
}) => {
    return (
        <div>
            <div className={styles["item"]}>
                <div>{item.name}</div>
                <InputNumber<number>
                    value={item.allocation_percentage}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value?.replace("%", "") as unknown as number}
                    onChange={handleChangeAllocationPercentage}
                    variant="borderless"
                />
            </div>
            <Slider
                min={0}
                max={100}
                value={typeof item.allocation_percentage === "number" ? item.allocation_percentage : 0}
                tooltip={{ formatter }}
                onChange={handleChangeAllocationPercentage}
                styles={{
                    track: {
                        background: item.color,
                    },
                }}
            />
        </div>
    );
};

export default BudgetItem;
