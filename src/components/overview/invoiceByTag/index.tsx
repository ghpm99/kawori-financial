import { useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";

import styles from "./invoiceByTag.module.scss";
import { Theme } from "@/styles/theme";

interface IInvoiceByTagProps {
    data: IInvoiceByTag[];
}

const InvoiceByTag = ({ data, theme }: { data: IInvoiceByTag[]; theme: Theme }) => {
    const dataset = [
        {
            label: "# Valor total por tag",
            data: data.map((item) => item.amount),
            backgroundColor: data.map((item) => item.color),
        },
    ];

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: "Valores por tag",
            },
        },
    };

    const dataSource = {
        labels: data.map((item) => item.name),
        datasets: dataset,
    };

    return (
        <div className={styles["chart-container"]}>
            <Pie
                data={dataSource}
                options={options}
                width={400}
                style={{
                    background:
                        theme === "dark" ? "var(--color-theme-color-grey0)" : " var(--color-neutral-color-pure-white)",
                    height: "100%",
                    paddingInline: "34px",
                    paddingBlock: "24px",
                    borderRadius: "20px",
                }}
            />
        </div>
    );
};

export default InvoiceByTag;
