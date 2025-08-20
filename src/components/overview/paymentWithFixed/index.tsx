import { Line } from "react-chartjs-2";

import { formatterMonthYearDate } from "@/util/index";
import styles from "./paymentWithFixed.module.scss";
import { Theme } from "@/styles/theme";

export default function PaymentWithFixed({ data, theme }: { data: IPaymentCharts[]; theme: Theme }) {
    const options = {
        responsive: true,
        interaction: {
            mode: "index" as const,
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: "Relatorio pagamentos",
            },
        },
        scales: {
            y: {
                type: "linear" as const,
                display: true,
                position: "left" as const,
            },
        },
    };
    const chartData = {
        labels: data.map((data) => formatterMonthYearDate(data.label)),
        datasets: [
            {
                label: "Credito",
                data: data.map((data) => data.credit),
                borderColor: "rgb(53, 162, 235)",
                backgroundColor: "rgba(53, 162, 235, 0.5)",
                lineTension: 0.3,
            },
            {
                label: "Debito",
                data: data.map((data) => data.debit),
                borderColor: "#820000",
                backgroundColor: "#8200007f",
                lineTension: 0.3,
            },
            {
                label: "Diferença",
                data: data.map((data) => data.difference),
                borderColor: "#048200",
                backgroundColor: "#04820073",
                lineTension: 0.3,
            },
        ],
    };

    return (
        <div className={styles["chart-container"]}>
            <Line
                data={chartData}
                options={options}
                width={400}
                height={200}
                style={{
                    background:
                        theme === "dark" ? "var(--color-theme-color-grey0)" : " var(--color-neutral-color-pure-white)",
                    paddingInline: "34px",
                    paddingBlock: "24px",
                    borderRadius: "20px",
                }}
            />
        </div>
    );
}
