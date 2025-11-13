import { InputNumber, Slider, SliderSingleProps } from "antd";

import { IBudget } from "@/components/providers/budget";

const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (value) => `${value}%`;

const BudgetItem = ({ item, handleChangeAmount }: { item: IBudget; handleChangeAmount: (amount: number) => void }) => {
    console.log(item);
    return (
        <div>
            <div>
                <div>{item.name}</div>
                <InputNumber<number>
                    value={item.amount}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value?.replace("%", "") as unknown as number}
                    onChange={handleChangeAmount}
                    variant="borderless"
                />
            </div>
            <Slider
                min={0}
                max={100}
                value={typeof item.amount === "number" ? item.amount : 0}
                tooltip={{ formatter }}
                onChange={handleChangeAmount}
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
